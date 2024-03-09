export const truncateString = (
	str: string,
	maxLength: number,
	ellipsis = "…"
): string => {
	if (str.length <= maxLength) {
		return str;
	}

	const truncated = str.substring(0, maxLength);
	return truncated + ellipsis;
};
