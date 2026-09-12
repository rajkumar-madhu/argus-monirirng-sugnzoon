import * as fs from 'fs';
import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface ArgusVmStackProps extends cdk.StackProps {
  /** CIDR allowed to reach UI (80) and OTLP (4317/4318). Dev default is open. */
  readonly allowedCidr: string;
  /** EC2 instance type name, e.g. t3.xlarge */
  readonly instanceTypeName: string;
  /** Container image for the Argus community binary */
  readonly argusImage: string;
}

export class ArgusVmStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ArgusVmStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', {
      maxAzs: 1,
      natGateways: 0,
      subnetConfiguration: [
        {
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC,
          cidrMask: 24,
        },
      ],
    });

    const sg = new ec2.SecurityGroup(this, 'VmSg', {
      vpc,
      description: 'Argus self-hosted VM ingress',
      allowAllOutbound: true,
    });
    sg.addIngressRule(ec2.Peer.ipv4(props.allowedCidr), ec2.Port.tcp(80), 'Argus UI/API');
    sg.addIngressRule(ec2.Peer.ipv4(props.allowedCidr), ec2.Port.tcp(4317), 'OTLP gRPC');
    sg.addIngressRule(ec2.Peer.ipv4(props.allowedCidr), ec2.Port.tcp(4318), 'OTLP HTTP');

    const role = new iam.Role(this, 'InstanceRole', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      description: 'Argus VM role with SSM only (no SSH keys)',
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      ],
    });

    const vmDir = path.join(__dirname, '..', '..', 'vm');
    const compose = fs.readFileSync(path.join(vmDir, 'docker-compose.yml'), 'utf8');
    const otel = fs.readFileSync(path.join(vmDir, 'otel-collector-config.yaml'), 'utf8');
    const argusYaml = fs.readFileSync(path.join(vmDir, 'argus.yaml'), 'utf8');
    const userDataScript = fs.readFileSync(path.join(vmDir, 'user-data.sh'), 'utf8');

    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'mkdir -p /opt/argus',
      `cat > /opt/argus/docker-compose.yml <<'ARGUS_EOF'\n${compose}\nARGUS_EOF`,
      `cat > /opt/argus/otel-collector-config.yaml <<'ARGUS_EOF'\n${otel}\nARGUS_EOF`,
      `cat > /opt/argus/argus.yaml <<'ARGUS_EOF'\n${argusYaml}\nARGUS_EOF`,
      `export ARGUS_IMAGE='${props.argusImage}'`,
      userDataScript,
    );

    const instance = new ec2.Instance(this, 'ArgusVm', {
      vpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PUBLIC },
      instanceType: new ec2.InstanceType(props.instanceTypeName),
      machineImage: ec2.MachineImage.latestAmazonLinux2023({
        cpuType: ec2.AmazonLinuxCpuType.X86_64,
      }),
      securityGroup: sg,
      role,
      userData,
      blockDevices: [
        {
          deviceName: '/dev/xvda',
          volume: ec2.BlockDeviceVolume.ebs(200, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            encrypted: true,
            deleteOnTermination: true,
          }),
        },
      ],
      requireImdsv2: true,
      detailedMonitoring: false,
    });
    cdk.Tags.of(instance).add('Name', 'argus-self-hosted-vm');

    new cdk.CfnOutput(this, 'InstanceId', { value: instance.instanceId });
    new cdk.CfnOutput(this, 'PublicIp', { value: instance.instancePublicIp });
    new cdk.CfnOutput(this, 'UiUrl', {
      value: `http://${instance.instancePublicIp}`,
      description: 'Argus UI (HTTP only in this dev stack; terminate TLS at a LB/domain next)',
    });
    new cdk.CfnOutput(this, 'SsmCommand', {
      value: `aws ssm start-session --target ${instance.instanceId}`,
      description: 'Connect without SSH keys',
    });
  }
}
