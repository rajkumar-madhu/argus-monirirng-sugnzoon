/* eslint-disable react/no-unescaped-entities */
import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import type { TabsProps } from 'antd';
import {
	Button,
	Col,
	Collapse,
	Flex,
	List,
	Modal,
	Row,
	Skeleton,
	Space,
	Tabs,
} from 'antd';
import { Typography } from '@signozhq/ui/typography';
import logEvent from 'api/common/logEvent';
import { createSubscription } from 'api/generated/services/subscriptions';
import RefreshPaymentStatus from 'components/RefreshPaymentStatus/RefreshPaymentStatus';
import ROUTES from 'constants/routes';
import { useNotifications } from 'hooks/useNotifications';
import { useSafeNavigate } from 'hooks/useSafeNavigate';
import AuthZTooltip from 'lib/authz/components/AuthZTooltip/AuthZTooltip';
import { SubscriptionCreatePermission } from 'lib/authz/hooks/useAuthZ/permissions/subscription.permissions';
import history from 'lib/history';
import { CircleArrowRight } from '@signozhq/icons';
import { useAppContext } from 'providers/App/App';
import APIError from 'types/api/error';
import { LicensePlatform } from 'types/api/licensesV3/getActive';
import { isModifierKeyPressed } from 'utils/app';
import { getBaseUrl } from 'utils/basePath';
import { getFormattedDate } from 'utils/timeUtils';

import InfoBlocks from './InfoBlocks';
import {
	enterpriseGradeValuesData,
	faqData,
	infoData,
} from './workspaceLocked.data';

import './WorkspaceLocked.styles.scss';

export default function WorkspaceBlocked(): JSX.Element {
	const { isFetchingActiveLicense, trialInfo, activeLicense } = useAppContext();
	const { notifications } = useNotifications();
	const { safeNavigate } = useSafeNavigate();

	const { t } = useTranslation(['workspaceLocked']);

	useEffect((): void => {
		void logEvent('Workspace Blocked: Screen Viewed', {});
	}, []);

	const handleContactUsClick = (): void => {
		void logEvent('Workspace Blocked: Contact Us Clicked', {});
	};

	const handleTabClick = (key: string): void => {
		void logEvent('Workspace Blocked: Screen Tabs Clicked', { tabKey: key });
	};

	const handleCollapseChange = (key: string | string[]): void => {
		const lastKey = Array.isArray(key) ? key.slice(-1)[0] : key;
		void logEvent('Workspace Blocked: Screen Tab FAQ Item Clicked', {
			panelKey: lastKey,
		});
	};

	useEffect(() => {
		if (!isFetchingActiveLicense) {
			const shouldBlockWorkspace = trialInfo?.workSpaceBlock;

			if (
				!shouldBlockWorkspace ||
				activeLicense?.platform === LicensePlatform.SELF_HOSTED
			) {
				history.push(ROUTES.HOME);
			}
		}
	}, [
		isFetchingActiveLicense,
		trialInfo?.workSpaceBlock,
		activeLicense?.platform,
	]);

	const { mutate: updateCreditCard, isLoading } = useMutation(
		createSubscription,
		{
			onSuccess: (data) => {
				if (data.data?.redirectURL) {
					const newTab = document.createElement('a');
					newTab.href = data.data.redirectURL;
					newTab.target = '_blank';
					newTab.rel = 'noopener noreferrer';
					newTab.click();
				}
			},
			onError: (error: APIError) =>
				notifications.error({
					message: error.getErrorCode(),
					description: error.getErrorMessage(),
				}),
		},
	);

	const handleUpdateCreditCard = useCallback(async () => {
		void logEvent('Workspace Blocked: User Clicked Update Credit Card', {});

		updateCreditCard({
			url: getBaseUrl(),
		});
	}, [updateCreditCard]);

	const handleExtendTrial = (): void => {
		void logEvent('Workspace Blocked: User Clicked Extend Trial', {});

		notifications.info({
			message: t('extendTrial'),
			duration: 0,
			description: (
				<Typography>
					{t('extendTrialMsgPart1')} {t('extendTrialMsgPart2')}
				</Typography>
			),
		});
	};

	const handleViewBilling = (e?: React.MouseEvent): void => {
		void logEvent('Workspace Blocked: User Clicked View Billing', {});

		safeNavigate(ROUTES.BILLING, { newTab: !!e && isModifierKeyPressed(e) });
	};

	const tabItems: TabsProps['items'] = [
		{
			key: 'whyChooseSignoz',
			label: t('whyChooseSignoz'),
			children: (
				<Row align="middle" justify="center">
					<Col span={12}>
						<Row gutter={[24, 48]}>
							<Col span={24}>
								<InfoBlocks items={infoData} />
							</Col>
							<Col span={24}>
								<Space size="large" direction="vertical">
									<Flex vertical>
										<Typography.Title level={3}>
											{t('enterpriseGradeObservability')}
										</Typography.Title>
										<Typography>{t('observabilityDescription')}</Typography>
									</Flex>
									<List
										itemLayout="horizontal"
										dataSource={enterpriseGradeValuesData}
										renderItem={(item, index): React.ReactNode => (
											<List.Item key={index}>
												<List.Item.Meta avatar={<CircleArrowRight />} title={item.title} />
											</List.Item>
										)}
									/>
								</Space>
							</Col>
							<Col span={24}>
								<AuthZTooltip
									checks={[SubscriptionCreatePermission]}
									withPortal={false}
								>
									<Button
										type="primary"
										shape="round"
										size="middle"
										loading={isLoading}
										onClick={handleUpdateCreditCard}
									>
										{t('continueToUpgrade')}
									</Button>
								</AuthZTooltip>
							</Col>
						</Row>
					</Col>
				</Row>
			),
		},
		{
			key: 'faqs',
			label: t('faqs'),
			children: (
				<Row align="middle" justify="center">
					<Col span={12}>
						<Space
							size="large"
							direction="vertical"
							className="workspace-locked__faq-container"
						>
							<Collapse
								items={faqData}
								defaultActiveKey={['self-hosted-observability']}
								onChange={handleCollapseChange}
							/>
							<AuthZTooltip checks={[SubscriptionCreatePermission]} withPortal={false}>
								<Button
									type="primary"
									shape="round"
									size="middle"
									loading={isLoading}
									onClick={handleUpdateCreditCard}
								>
									{t('continueToUpgrade')}
								</Button>
							</AuthZTooltip>
						</Space>
					</Col>
				</Row>
			),
		},
	];

	return (
		<div>
			<Modal
				rootClassName="workspace-locked__modal"
				title={
					<div className="workspace-locked__modal__header">
						<span className="workspace-locked__modal__title">
							{t('trialPlanExpired')}
						</span>
						<span className="workspace-locked__modal__header__actions">
							<Flex gap={8} justify="center" align="center">
								<Button
									className="workspace-locked__modal__header__actions__billing"
									type="link"
									size="small"
									onClick={(e): void => handleViewBilling(e)}
								>
									View Billing
								</Button>

								<RefreshPaymentStatus withPortal={false} />
							</Flex>

							<Button
								type="default"
								shape="round"
								size="middle"
								href="https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues"
								target="_blank"
								rel="noopener noreferrer"
								data-testid="workspace-locked-report-issue"
								className="periscope-btn"
								onClick={handleContactUsClick}
							>
								Report an issue
							</Button>
						</span>
					</div>
				}
				open
				closable={false}
				footer={null}
				width="65%"
			>
				<div className="workspace-locked__container">
					{isFetchingActiveLicense || !trialInfo ? (
						<Skeleton />
					) : (
						<>
							<Row justify="center" align="middle">
								<Col>
									<Space direction="vertical" align="center">
										<Typography.Title level={2}>
											<div className="workspace-locked__title">
												{t('upgradeToContinue')}
											</div>
										</Typography.Title>
										<Typography.Text className="workspace-locked__details">
											{t('upgradeNow')}
											<br />
											{trialInfo.gracePeriodEnd > 0 && (
												<>
													{t('yourDataIsSafe')}{' '}
													<span className="workspace-locked__details__highlight">
														{getFormattedDate(trialInfo.gracePeriodEnd)}
													</span>{' '}
												</>
											)}
											<span className="translate-safe">{t('actNow')}</span>
										</Typography.Text>
									</Space>
								</Col>
							</Row>
							<Flex gap={8} vertical justify="center" align="center">
								<Row
									justify="center"
									align="middle"
									className="workspace-locked__modal__cta"
									gutter={[8, 8]}
								>
									<Col>
										<AuthZTooltip
											checks={[SubscriptionCreatePermission]}
											withPortal={false}
										>
											<Button
												type="primary"
												shape="round"
												size="middle"
												loading={isLoading}
												onClick={handleUpdateCreditCard}
											>
												Continue my Journey
											</Button>
										</AuthZTooltip>
									</Col>
									<Col>
										<Button
											type="default"
											shape="round"
											size="middle"
											className="periscope-btn"
											onClick={handleExtendTrial}
										>
											{t('needMoreTime')}
										</Button>
									</Col>
								</Row>
							</Flex>

							<div className="workspace-locked__tabs">
								<Tabs
									items={tabItems}
									defaultActiveKey="whyChooseSignoz"
									onTabClick={handleTabClick}
								/>
							</div>
						</>
					)}
				</div>
			</Modal>
		</div>
	);
}
