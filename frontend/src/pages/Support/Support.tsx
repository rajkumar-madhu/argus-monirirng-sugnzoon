import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Card } from 'antd';
import { Typography } from '@signozhq/ui/typography';
import logEvent from 'api/common/logEvent';
import { ArrowUpRight, Book, Github, LifeBuoy, Slack } from '@signozhq/icons';
import { openInNewTab } from 'utils/navigation';

import './Support.styles.scss';

const { Title, Text } = Typography;

interface Channel {
	key: string;
	name?: string;
	icon?: JSX.Element;
	title?: string;
	url: string;
	btnText?: string;
	isExternal?: boolean;
}

const channelsMap = {
	documentation: 'documentation',
	github: 'github',
	slack_community: 'slack_community',
};

const supportChannels = [
	{
		key: 'documentation',
		name: 'Documentation',
		icon: <Book size={16} />,
		title: 'Find answers in the documentation.',
		url: 'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/blob/codex/fix-api-generation/docs/wecrew/getting-started.md',
		btnText: 'Visit docs',
		isExternal: true,
	},
	{
		key: 'github',
		name: 'Github',
		icon: <Github size={16} />,
		title: 'Create an issue on GitHub to report bugs or request new features.',
		url: 'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues',
		btnText: 'Create issue',
		isExternal: true,
	},
	{
		key: 'slack_community',
		name: 'Source',
		icon: <Slack size={16} />,
		title: 'Browse the WeCrew source and self-hosting guides.',
		url: 'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon',
		btnText: 'View source',
		isExternal: true,
	},
];

export default function Support(): JSX.Element {
	const history = useHistory();
	const handleChannelWithRedirects = (url: string): void => {
		openInNewTab(url);
	};

	useEffect(() => {
		if (history?.location?.state) {
			const historyState = history.location.state as { from?: string };

			if (historyState.from) {
				void logEvent(`Support : From URL : ${historyState.from}`, {});
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleChannelClick = (channel: Channel): void => {
		void logEvent(`Support : ${channel.name}`, {});

		switch (channel.key) {
			case channelsMap.documentation:
			case channelsMap.github:
			case channelsMap.slack_community:
				handleChannelWithRedirects(channel.url);
				break;
			default:
				handleChannelWithRedirects(
					'https://github.com/rajkumar-madhu/argus-monirirng-sugnzoon/issues',
				);
				break;
		}
	};

	return (
		<div className="support-page-container">
			<header className="support-page-header">
				<div className="support-page-header-title" data-testid="support-page-title">
					<LifeBuoy size={16} />
					Support
				</div>
			</header>

			<div className="support-page-content">
				<div className="support-page-content-description">
					We are here to help in case of questions or issues. Pick the channel that
					is most convenient for you.
				</div>

				<div className="support-channels">
					{supportChannels.map(
						(channel): JSX.Element => (
							<Card className="support-channel" key={channel.key}>
								<div className="support-channel-content">
									<Title truncate={1} level={5} className="support-channel-title">
										{channel.icon}
										{channel.name}{' '}
									</Title>
									<Text> {channel.title} </Text>
								</div>

								<div className="support-channel-action">
									<Button
										className="periscope-btn secondary support-channel-btn"
										type="default"
										onClick={(): void => handleChannelClick(channel)}
									>
										<Text truncate={1}>{channel.btnText} </Text>
										{channel.isExternal && <ArrowUpRight size={14} />}
									</Button>
								</div>
							</Card>
						),
					)}
				</div>
			</div>
		</div>
	);
}
