<template>
	<div>
		<base-breadcrumb :inputs="breadcrumb" />
		<h1>{{ datasource.name }}</h1>
		<loading-modal
			:title="
				$t('pages.administration.datasources._id.run._id.dialog.loading.title')
			"
			:description="
				$t(
					'pages.administration.datasources._id.run._id.dialog.loading.description'
				)
			"
			:active="state === 'Pending'"
			@update:active="abbortLoading"
		/>
		<component
			:is="detailComponent"
			v-if="state === 'Success'"
			:key="datasource._id"
			:datasource="datasource"
			:datasource-id="$route.params.datasource"
			:run="run"
			:run-id="$route.params.run"
		/>
	</div>
</template>

<script>
import LoadingModal from "@components/molecules/LoadingModal";
import { mapActions } from "vuex";

// TODO mount other dataresource views here (LDAP, RSS)
const datasourceComponents = {
	webuntis: () => import("@components/organisms/DatasourceRunWebuntis"),
};

const startInterval = 500;
const intervalFactor = 2;
const maxInterval = 10000;

export default {
	components: {
		LoadingModal,
	},
	async asyncData({ store, params, app: { i18n } }) {
		const datasource = await store.dispatch(
			"datasources/get",
			params.datasource
		);
		if (!datasource?.config?.target) {
			throw new Error(
				i18n.t(
					"pages.administration.datasources._id.run._id.error.unknown_datasource"
				)
			);
		}
		return {
			datasource,
			type: datasource?.config?.target,
		};
	},
	data() {
		return {
			state: "Pending",
			run: {
				dryrun: true,
			},
			interval: startInterval,
		};
	},
	meta: {
		requiredPermissions: ["DATASOURCES_VIEW"],
	},
	computed: {
		breadcrumb() {
			return [
				{
					text: this.$t("pages.administration.index.title"),
					to: "/administration/",
					icon: { source: "fa", icon: "fas fa-cog" },
				},
				{
					text: this.$t("pages.administration.datasources.index.title"),
					to: "/administration/datasources",
				},
				{
					text: this.datasource?.name,
				},
			];
		},
		detailComponent() {
			const component = datasourceComponents[this.type];
			if (!component) {
				// should never be reached as long as all types are correctly implemented.
				throw new Error("Can not find detailComponent for target of run.");
			}
			return component;
		},
	},
	watch: {
		state: {
			handler(to) {
				if (to === "Error") {
					// TODO maybe we can show the user some details if the backend provides them?
					throw new Error(
						this.$t("pages.administration.datasources._id.run._id.error")
					);
				}
			},
			immediate: true,
		},
	},
	created() {
		this.checkStatus();
		//setTimeout(() => (this.state = "Success"), 1000);
	},
	methods: {
		...mapActions("datasourceRuns", {
			get: "get",
		}),
		async checkStatus() {
			this.run = await this.get(this.$route.params.run);
			const { status } = this.run;
			if (status === "Pending") {
				this.interval = Math.min(maxInterval, this.interval * intervalFactor);
				setTimeout(this.checkStatus, this.interval);
				return;
			}
			this.state = status;
		},
		abbortLoading(to) {
			if (to === false) {
				this.$router.push({ path: "/administration/datasources" });
			}
		},
	},
	head() {
		return {
			title: "result", // TODO set correct title
		};
	},
};
</script>

<style lang="scss" scoped>
@import "@styles";
</style>
