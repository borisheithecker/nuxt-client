<template>
	<div>
		<base-breadcrumb :inputs="breadcrumbs" />
		<h1 class="h3"> {{ $t("pages.administration.datasources.new.title") }}</h1>
		<datasource-card
			v-for="provider in datasourceProvider"
			:key="provider.name"
			:image="provider.icon"
			:title="provider.name"
			class="mb--md"
		>
			<template v-slot:actions>
				<BaseButton design="primary text">
					<BaseIcon source="custom" icon="datasource-add" />
					{{ $t("pages.administration.datasources.new.add") }}
				</BaseButton>
			</template>
		</datasource-card>
	</div>
</template>

<script>
import BaseBreadcrumb from "@components/base/BaseBreadcrumb";
import DatasourceCard from "@components/molecules/DatasourceCard";

export default {
	components: {
		BaseBreadcrumb,
		DatasourceCard,
	},
	meta: {
		requiredPermissions: ["DATASOURCES_VIEW"],
	},
	data() {
		return {
			breadcrumbs: [
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
					text: this.$t("pages.administration.datasources.new.short_title"),
				},
			],
			datasourceProvider: [
				{
					name: this.$t(
						"pages.administration.datasources.new.provider.WebUntis.name"
					),
					icon: require("@assets/img/datasources/logo-webuntis.png"),
				},
				{
					name: this.$t(
						"pages.administration.datasources.new.provider.LDAP.name"
					),
					icon: require("@assets/img/datasources/logo-ldap.svg"),
				},
				{
					name: this.$t(
						"pages.administration.datasources.new.provider.RSS.name"
					),
					icon: require("@assets/img/datasources/logo-rss.png"),
				},
			],
		};
	},
	head() {
		return {
			title: this.$t("pages.administration.datasources.new.title"),
		};
	},
};
</script>

<style lang="scss" scoped>
@import "@styles";
</style>