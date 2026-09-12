import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button, Skeleton } from 'antd';
import { Badge } from '@signozhq/ui/badge';
import logEvent from 'api/common/logEvent';
import { useListRules } from 'api/generated/services/rules';
import type { RuletypesRuleDTO } from 'api/generated/services/sigNoz.schemas';
import { QueryParams } from 'constants/query';
import ROUTES from 'constants/routes';
import history from 'lib/history';
import { mapQueryDataFromApi } from 'lib/newQueryBuilder/queryBuilderMappers/mapQueryDataFromApi';
import { ArrowRight, ArrowUpRight, Plus } from '@signozhq/icons';
import Card from 'periscope/components/Card/Card';
import { useAppContext } from 'providers/App/App';
import { toCompositeMetricQuery } from 'types/api/alerts/convert';
import { USER_ROLES } from 'types/roles';

import beaconUrl from '@/assets/Icons/beacon.svg';

import { getItemIcon } from '../constants';

export default function AlertRules({
	onUpdateChecklistDoneItem,
	loadingUserPreferences,
}: {
	onUpdateChecklistDoneItem: (itemKey: string) => void;
	loadingUserPreferences: boolean;
}): JSX.Element {
	const { user } = useAppContext();
	const [rulesExist, setRulesExist] = useState(false);

	const [sortedAlertRules, setSortedAlertRules] = useState<RuletypesRuleDTO[]>(
		[],
	);

	const location = useLocation();
	const params = new URLSearchParams(location.search);

	// Fetch Alerts
	const {
		data: alerts,
		isError,
		isLoading,
	} = useListRules({
		query: { cacheTime: 0 },
	});

	useEffect(() => {
		const rules = alerts?.data ?? [];
		setRulesExist(rules.length > 0);

		const sortedRules = [...rules].sort((a, b) => {
			// First, prioritize firing alerts
			if (a.state === 'firing' && b.state !== 'firing') {
				return -1;
			}
			if (a.state !== 'firing' && b.state === 'firing') {
				return 1;
			}

			// Then sort by updatedAt timestamp
			return (
				new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()
			);
		});

		if (sortedRules.length > 0 && !loadingUserPreferences) {
			onUpdateChecklistDoneItem('SETUP_ALERTS');
		}

		setSortedAlertRules(sortedRules.slice(0, 5));
	}, [alerts, onUpdateChecklistDoneItem, loadingUserPreferences]);

	const emptyStateCard = (): JSX.Element => (
		<div className="empty-state-container">
			<div className="empty-state-content-container">
				<div className="empty-state-content">
					<img src={beaconUrl} alt="empty-alert-icon" className="empty-state-icon" />

					<div className="empty-title">No Alert rules yet.</div>

					{user?.role !== USER_ROLES.VIEWER && (
						<div className="empty-description">
							Create an Alert Rule to get started
						</div>
					)}
				</div>

				{user?.role !== USER_ROLES.VIEWER && (
					<div className="empty-actions-container">
						<Link to={ROUTES.ALERTS_NEW}>
							<Button
								type="default"
								className="periscope-btn secondary"
								icon={<Plus size={16} />}
								onClick={(): void => {
									void logEvent('Homepage: Create alert rule clicked', {});
								}}
							>
								Create Alert Rule
							</Button>
						</Link>

						<Button
							type="link"
							className="learn-more-link"
							onClick={(): void => {
								void logEvent('Homepage: Learn more clicked', {
									source: 'Alert Rules',
								});

								window.open(
									'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/getting-started.md#alerts',
									'_blank',
									'noreferrer noopener',
								);
							}}
						>
							Learn more <ArrowUpRight size={12} />
						</Button>
					</div>
				)}
			</div>
		</div>
	);

	const onEditHandler = (record: RuletypesRuleDTO) => (): void => {
		void logEvent('Homepage: Alert clicked', {
			ruleId: record.id,
			ruleName: record.alert,
			ruleState: record.state,
		});

		const compositeQuery = mapQueryDataFromApi(
			toCompositeMetricQuery(record.condition.compositeQuery),
		);
		params.set(
			QueryParams.compositeQuery,
			encodeURIComponent(JSON.stringify(compositeQuery)),
		);

		const panelType = record.condition.compositeQuery.panelType;
		if (panelType) {
			params.set(QueryParams.panelTypes, panelType);
		}

		params.set(QueryParams.ruleId, record.id);

		history.push(`${ROUTES.ALERT_OVERVIEW}?${params.toString()}`);
	};

	const renderAlertRules = (): JSX.Element => (
		<div className="alert-rules-container home-data-item-container">
			<div className="alert-rules-list">
				{sortedAlertRules.map((rule, index) => (
					<button
						type="button"
						data-testid="home-alert-rule"
						style={{
							border: 0,
							font: 'inherit',
							color: 'inherit',
							textAlign: 'left',
							width: '100%',
							background:
								index % 2 === 0
									? 'color-mix(in srgb, var(--l1-foreground) 1%, transparent)'
									: 'transparent',
						}}
						className="alert-rule-item home-data-item"
						key={rule.id}
						onClick={onEditHandler(rule)}
					>
						<span className="alert-rule-item-name-container home-data-item-name-container">
							<img
								src={getItemIcon(rule.id)}
								alt="alert-rules"
								className="alert-rules-img"
							/>

							<span className="alert-rule-item-name home-data-item-name">
								{rule.alert}
							</span>
						</span>

						<span className="alert-rule-item-description home-data-item-tag">
							<Badge color="sienna" variant="outline">
								{rule?.labels?.severity}
							</Badge>

							{rule.state === 'firing' && (
								<Badge color="cherry" variant="outline" className="firing-tag">
									{rule.state}
								</Badge>
							)}
						</span>
					</button>
				))}
			</div>
		</div>
	);

	if (isLoading) {
		return (
			<Card className="dashboards-list-card home-data-card loading-card">
				<Card.Content>
					<Skeleton active />
				</Card.Content>
			</Card>
		);
	}

	if (isError) {
		return (
			<Card className="dashboards-list-card home-data-card error-card">
				<Card.Content>
					<Skeleton active />
				</Card.Content>
			</Card>
		);
	}

	return (
		<Card className="alert-rules-card home-data-card">
			{rulesExist && (
				<Card.Header>
					<div className="alert-rules-header home-data-card-header">Alerts</div>
				</Card.Header>
			)}
			<Card.Content>
				{rulesExist ? renderAlertRules() : emptyStateCard()}
			</Card.Content>

			{rulesExist && (
				<Card.Footer>
					<div className="alert-rules-footer home-data-card-footer">
						<Link to={ROUTES.LIST_ALL_ALERT}>
							<Button
								type="link"
								className="periscope-btn link learn-more-link"
								onClick={(): void => {
									void logEvent('Homepage: All alert rules clicked', {});
								}}
							>
								All Alert Rules <ArrowRight size={12} />
							</Button>
						</Link>
					</div>
				</Card.Footer>
			)}
		</Card>
	);
}
