
export const getStatusType = (status : string) : string => {
	const map = STATUS_MAP;
	return Object.hasOwn(map, status) ? map[status] : 'unknow';
};

export const STATUS_MAP: Record<string, string> = {
		'已撤回': 'withdraw',
		'已退回': 'return',
		'已终止': 'terminate',
		'已通过': 'pass',
		'审批中': 'in_progress',
		'编辑中': 'draft',
		'已拒绝': 'reject',
		'作废': 'invalid',
		'异常': 'exception'
}