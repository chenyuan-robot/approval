
export const getStatusText = (status : string) : string => {
	const map : Record<string, string> = {
		withdraw: '已撤回',
		return: '已退回',
		terminate: '已终止',
		pass: '已通过',
		in_progress: '审批中',
		draft: '编辑中',
		reject: '未通过',
		invalid: '作废',
		exception: '异常'
	};
	return Object.hasOwn(map, status) ? map[status] : '未知';
};