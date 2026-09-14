export function isUsableSupportEmail(email: string): boolean {
	if (!/^[^\s@?&#]+@[^\s@?&#]+\.[^\s@?&#]+$/.test(email)) {
		return false;
	}
	const domain = email.split('@')[1].toLowerCase();
	return !/(^|\.)example\.(com|org|net)$/.test(domain);
}
