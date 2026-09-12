import { useEffect } from 'react';
import { Button, Col, Modal, Row, Skeleton, Space } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import ROUTES from 'constants/routes';
import history from 'lib/history';
import { useAppContext } from 'providers/App/App';
import { LicensePlatform, LicenseState } from 'types/api/licensesV3/getActive';

import featureGraphicCorrelationUrl from '@/assets/Images/feature-graphic-correlation.svg';

import './WorkspaceAccessRestricted.styles.scss';

function WorkspaceAccessRestricted(): JSX.Element {
	const { activeLicense, isFetchingActiveLicense } = useAppContext();

	useEffect(() => {
		if (!isFetchingActiveLicense) {
			const isTerminated = activeLicense?.state === LicenseState.TERMINATED;
			const isExpired = activeLicense?.state === LicenseState.EXPIRED;
			const isCancelled = activeLicense?.state === LicenseState.CANCELLED;

			const isWorkspaceAccessRestricted = isTerminated || isExpired || isCancelled;

			if (
				!isWorkspaceAccessRestricted ||
				activeLicense.platform === LicensePlatform.SELF_HOSTED
			) {
				history.push(ROUTES.HOME);
			}
		}
	}, [isFetchingActiveLicense, activeLicense]);

	return (
		<div>
			<Modal
				rootClassName="workspace-access-restricted__modal"
				title={
					<div className="workspace-access-restricted__modal__header">
						<span className="workspace-access-restricted__modal__title">
							Your workspace access is restricted
						</span>
					</div>
				}
				open
				closable={false}
				footer={null}
				width="65%"
			>
				<div className="workspace-access-restricted__container">
					{isFetchingActiveLicense || !activeLicense ? (
						<Skeleton />
					) : (
						<>
							<Row justify="center" align="middle">
								<Col>
									<Space direction="vertical" align="center">
										<Typography.Title
											level={4}
											className="workspace-access-restricted__details"
										>
											{activeLicense.state === LicenseState.TERMINATED && (
												<>
													Your WeCrew license is terminated. Contact your workspace
													administrator to review access and licensing options.
												</>
											)}
											{activeLicense.state === LicenseState.EXPIRED && (
												<>
													Your WeCrew license is expired. Contact your workspace
													administrator to review access and licensing options.
												</>
											)}
											{activeLicense.state === LicenseState.CANCELLED && (
												<>
													Your WeCrew license is cancelled. Contact your workspace
													administrator to review access and licensing options.
												</>
											)}
										</Typography.Title>

										<Button
											type="default"
											shape="round"
											size="middle"
											href="https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues"
											target="_blank"
											rel="noopener noreferrer"
											data-testid="restricted-report-issue"
										>
											Report an issue
										</Button>
									</Space>
								</Col>
							</Row>
							<div className="workspace-access-restricted__creative">
								<img src={featureGraphicCorrelationUrl} alt="correlation-graphic" />
							</div>
						</>
					)}
				</div>
			</Modal>
		</div>
	);
}

export default WorkspaceAccessRestricted;
