import { type ChangeEvent, type KeyboardEvent, useState } from 'react';
import { generatePath } from 'react-router-dom';
import {
	Check,
	LayoutDashboard,
	LoaderCircle,
	SquareArrowOutUpRight,
} from '@signozhq/icons';
import { Button } from '@signozhq/ui/button';
import { Input } from '@signozhq/ui/input';
import { toast } from '@signozhq/ui/sonner';
import { Typography } from '@signozhq/ui/typography';
import logEvent from 'api/common/logEvent';
import { createDashboardV2 } from 'api/generated/services/dashboard';
import ROUTES from 'constants/routes';
import { useGetTenantLicense } from 'hooks/useGetTenantLicense';
import { useSafeNavigate } from 'hooks/useSafeNavigate';
import { useErrorModal } from 'providers/ErrorModalProvider';
import { DashboardListEvents } from 'pages/DashboardsListPage/constants/events';
import APIError from 'types/api/error';

import {
	LOG_STARTER_TEMPLATES,
	LogStarterTemplate,
} from './logStarterTemplates';

import styles from './NewDashboardModal.module.scss';

const TEMPLATES_DOCS_URL =
	'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/feat/argus-community-fork/docs/ARGUS.md';

function TemplatesPanel(): JSX.Element {
	const { isCloudUser } = useGetTenantLicense();
	const { safeNavigate } = useSafeNavigate();
	const { showErrorModal } = useErrorModal();
	const [name, setName] = useState('');
	const [submitting, setSubmitting] = useState(false);
	const [creatingId, setCreatingId] = useState<string | null>(null);

	const requestName = name.trim();

	const handleRequest = async (): Promise<void> => {
		if (!requestName || submitting) {
			return;
		}
		try {
			setSubmitting(true);
			const response = await logEvent('Dashboard Requested', {
				screen: 'Dashboard list page',
				dashboard: requestName,
			});
			if (response.statusCode === 200) {
				toast.success('Dashboard request submitted');
				setName('');
			} else {
				toast.error(response.error || 'Something went wrong');
			}
		} catch {
			toast.error('Something went wrong');
		} finally {
			setSubmitting(false);
		}
	};

	const handleCreateStarter = async (
		template: LogStarterTemplate,
	): Promise<void> => {
		if (creatingId) {
			return;
		}
		try {
			setCreatingId(template.id);
			const created = await createDashboardV2(template.payload);
			void logEvent(DashboardListEvents.DashboardCreated, {
				method: 'log-starter',
				templateId: template.id,
			});
			safeNavigate(
				generatePath(ROUTES.DASHBOARD, { dashboardId: created.data.id }),
			);
		} catch (error) {
			showErrorModal(error as APIError);
			toast.error(
				error instanceof Error ? error.message : 'Failed to create starter pack',
			);
		} finally {
			setCreatingId(null);
		}
	};

	return (
		<div className={styles.templatesPanel}>
			<span className={styles.templatesIcon}>
				<LayoutDashboard size={20} />
			</span>
			<Typography variant="title" size="lg" weight="semibold">
				Dashboard templates
			</Typography>
			<Typography
				variant="text"
				size="sm"
				color="muted"
				className={styles.templatesDesc}
			>
				Start from Argus log starter packs (Log Observer–style), or browse docs for
				more patterns. Starter packs create a named dashboard; add panels from Logs
				Explorer with Add to dashboard.
			</Typography>

			<div className={styles.starterList}>
				{LOG_STARTER_TEMPLATES.map((template) => (
					<div key={template.id} className={styles.starterCard}>
						<div>
							<Typography variant="text" size="sm" weight="semibold">
								{template.title}
							</Typography>
							<Typography variant="text" size="xs" color="muted">
								{template.description}
							</Typography>
						</div>
						<Button
							variant="solid"
							color="primary"
							size="sm"
							disabled={creatingId !== null}
							testId={`log-starter-${template.id}`}
							prefix={
								creatingId === template.id ? (
									<LoaderCircle size={14} className={styles.spinner} />
								) : undefined
							}
							onClick={(): void => {
								void handleCreateStarter(template);
							}}
						>
							Use template
						</Button>
					</div>
				))}
			</div>

			<a
				className={styles.browseLink}
				href={TEMPLATES_DOCS_URL}
				target="_blank"
				rel="noopener noreferrer"
			>
				Argus logs &amp; dashboard notes
				<SquareArrowOutUpRight size={14} />
			</a>

			{isCloudUser && (
				<div className={styles.requestForm}>
					<Typography
						variant="text"
						size="sm"
						weight="semibold"
						className={styles.requestHeader}
					>
						Request a new template
					</Typography>
					<div className={styles.requestRow}>
						<Input
							className={styles.requestInput}
							placeholder="Enter dashboard name..."
							value={name}
							testId="request-dashboard-name"
							onChange={(e: ChangeEvent<HTMLInputElement>): void =>
								setName(e.target.value)
							}
							onKeyDown={(e: KeyboardEvent<HTMLInputElement>): void => {
								if (e.key === 'Enter') {
									void handleRequest();
								}
							}}
						/>
						<Button
							variant="solid"
							color="primary"
							size="md"
							disabled={submitting || requestName.length === 0}
							testId="request-dashboard-submit"
							prefix={
								submitting ? (
									<LoaderCircle size={14} className={styles.spinner} />
								) : (
									<Check size={14} />
								)
							}
							onClick={(): void => {
								void handleRequest();
							}}
						>
							Submit
						</Button>
					</div>
				</div>
			)}
		</div>
	);
}

export default TemplatesPanel;
