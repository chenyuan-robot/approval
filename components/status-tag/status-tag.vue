<template>
  <text class="status-tag" :class="statusClass">{{ status }}</text>
</template>

<script setup>
import { computed } from 'vue'
import { getStatusType } from "@/hooks/base/status"

const props = defineProps({
  status: {
    type: String,
    required: true
  },
})

const statusClass = computed(() => {
  return 'tag-' + getStatusType(props.status)
})

</script>


<style scoped>
.status-tag {
	font-size: 24rpx;
	padding: 6rpx 16rpx;
	border-radius: 8rpx;

	&.tag-in_progress {
		background-color: rgba(62, 63, 237, 0.1);
		color: #3e3fed;
	}

	&.tag-pass {
		background-color: rgba(0, 177, 39, 0.1);
		color: #00B42A;
	}

	&.tag-withdraw {
		background-color: rgba(255, 128, 0, 0.1);
		color: #FF7D00;
	}

	&.tag-reject {
		background-color: rgba(245, 63, 63, 0.1);
		color: #F53F3F;
	}

	&.tag-draft {
		background-color: rgba(31, 89, 244, 0.1);
		color: #1f59f4;
	}

	&.tag-terminate {
		background-color: #FCF1F0;
		color: #CF2F23;
	}

	&.tag-return {
		background-color: #F1F2F3;
		color: #636A78;
	}

	&.tag-exception {
		background-color: #FEECEC;
		color: #FF1B1F;
	}

	&.tag-invalid {
		background-color: #F1F2F3;
		color: #636A78;
	}
}
</style>