<template>
	<div class="card">
		<div class="card-body">
			<img :src="image" class="image" role="presentation" />
			<div class="card-heading">
				<div class="h6">
					<slot name="title">
						{{ title }}
					</slot>
				</div>
				<div class="subtitle">
					<slot name="subtitle">
						{{ subtitle }}
					</slot>
				</div>
			</div>
		</div>
		<div class="card-action">
			<slot name="actions" />
		</div>
	</div>
</template>
<script>
export default {
	props: {
		image: {
			type: String,
			required: true,
		},
		title: {
			type: String,
			default: "",
		},
		subtitle: {
			type: String,
			default: "",
		},
	},
};
</script>

<style lang="scss" scoped>
@import "@styles";

.card {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: auto;
	padding: var(--space-xs);
	border-radius: var(--radius-sm);
	box-shadow: var(--shadow-xxxs);
}

.card-body {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.card-heading {
	overflow: hidden;
}

.h6 {
	margin: 0;
	overflow: hidden;
	text-overflow: ellipsis;
}

.subtitle {
	overflow: hidden;
	font-size: var(--text-xs);
	text-overflow: ellipsis;
	white-space: nowrap;

	@include breakpoint(tablet) {
		display: flex;
		grid-template-areas: "secondary primary";
		align-items: center;
	}

	.icon {
		margin-left: var(--space-xs-3);
	}
}
.image {
	height: calc(var(--text-md) + var(--text-lg));
	object-fit: contain;
	margin-right: var(--space-sm);
	border-radius: var(--radius-sm);
}
.card-action {
	display: flex;
}

p {
	margin: 0;
}
</style>
