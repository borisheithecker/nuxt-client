<template>
	<div>
		<chip-filter :value.sync="activeToggle" :options="toggleTags" />
		<floating-fab
			icon="add"
			to="/courses/create"
			:aria-label="$t('pages.courses.new.btn_new')"
		/>
		<courses-grid :courses="courses"></courses-grid>
	</div>
</template>

<script>
import { mapGetters } from "vuex";
import CoursesGrid from "@components/molecules/CoursesGrid";
import ChipFilter from "@components/molecules/ChipFilter";
import FloatingFab from "@components/molecules/FloatingFab";

export default {
	layout: "loggedInFull",
	components: {
		CoursesGrid,
		ChipFilter,
		FloatingFab,
	},
	data() {
		return {
			toggleTags: ["Aktuell", "Archiviert"],
			activeToggle: "Aktuell",
		};
	},
	computed: {
		...mapGetters("courses", {
			courses: "list",
		}),
		filteredCourses() {
			if (this.activeToggle === "Aktuell") {
				return this.courses.filter((course) => !course.isArchived);
			} else {
				return this.courses.filter((course) => course.isArchived);
			}
		},
	},
	created(ctx) {
		this.find();
	},
	methods: {
		find() {
			this.$store.dispatch("courses/find");
		},
	},
	head() {
		return {
			title: "Kurse",
		};
	},
};
</script>
<style lang="scss" scoped>
@import "@variables";

.bottom {
	float: left;
	margin-top: var(--space-xl);
	margin-left: var(--space-xl-3);
}

.courses-grid {
	margin-top: var(--space-xl);
}
</style>
