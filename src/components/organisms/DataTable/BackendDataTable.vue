<template>
	<div class="table-outer">
		<div class="table-wrapper">
			<div class="toolbelt">
				<row-selection-bar
					ref="rowSelectionBar"
					:actions="actions"
					:all-rows-of-all-pages-selected.sync="allRowsOfAllPagesSelected"
					:all-rows-of-current-page-selected.sync="allRowsOfCurrentPageSelected"
					:number-of-selected-items="numberOfSelectedItems"
					:total-number-of-items="total"
					@fire-action="fireAction"
				/>
			</div>
			<table class="table">
				<thead>
					<component
						:is="componentHeaderRow"
						:all-rows-selectable="rowsSelectable"
						:all-rows-selected.sync="allRowsOfCurrentPageSelected"
						:columns="columns"
						:sort-by.sync="sortByProxy"
						:sort-order.sync="sortOrderProxy"
					/>
				</thead>
				<tbody>
					<component
						:is="componentDataRow"
						v-for="(row, rowindex) in data"
						:key="rowindex"
						:selectable="rowsSelectable"
						:rowindex="rowindex"
						:selected="isRowSelected(row)"
						:column-keys="columnKeys"
						:data="row"
						@update:selected="setRowSelection(row, $event)"
					>
						<template
							v-for="(cmp, name) in dataRowSlots"
							v-slot:[name]="{ data: columnData }"
						>
							<slot :name="name" :data="columnData" />
						</template>
					</component>
				</tbody>
			</table>
		</div>

		<pagination
			class="mt--md"
			:current-page="currentPage"
			:total="total"
			:per-page="rowsPerPage"
			@update:per-page="onUpdateRowsPerPage"
			@update:current-page="$emit('update:current-page', $event)"
		/>
	</div>
</template>

<script>
import { getValueByPath } from "@utils/helpers";

import TableDataRow from "./TableDataRow.vue";
import TableHeadRow from "./TableHeadRow.vue";
import Pagination from "@components/organisms/Pagination.vue";
import RowSelectionBar from "./RowSelectionBar.vue";

export default {
	components: {
		Pagination,
		RowSelectionBar,
	},
	props: {
		/**
		 * Defines the visible columns
		 * `{ label, field?, sortable? }` (? indicates optional fields)
		 */
		columns: {
			type: Array,
			default: () => [],
			validator: (columns) => columns.every((column) => column.label),
		},
		/**
		 * Array of objects
		 */
		data: {
			type: Array,
			default: () => [],
		},
		/**
		 * Defines the path to a unqiue key in the object
		 */
		trackBy: {
			type: String,
			required: true,
		},

		paginated: Boolean,
		/**
		 * The total number of available rows (including not visible items from other pages)
		 */
		total: {
			type: Number,
			default: 0,
		},
		/**
		 * index of the current page. The first page is 1
		 */
		currentPage: {
			type: Number,
			default: 1,
		},
		rowsPerPage: {
			type: Number,
			default: 25,
		},

		/**
		 * enables checkboxes next to each row
		 */
		rowsSelectable: {
			type: Boolean,
		},
		/**
		 * toggles wheather the selectedRowIds prop (should) contain all selected or all unselected rows
		 * this is a trick to make all rows selectable even if we do not know all items yet.
		 */
		selectionType: {
			type: String,
			default: "inclusive",
			validator: (val) => ["inclusive", "exclusive"].includes(val),
		},
		/**
		 * All identifiers that are located at the trackBy key of the selected/deselected items.
		 * Depending of the selectMode (inclusive/exclusive) this contains the selected or unselected Items
		 */
		selectedRowIds: {
			type: Array,
			default: () => [],
		},

		/**
		 * Array of Objects.
		 * Each Object must define a function "action" that will be called with the list of current selectionIds and the selectionType.
		 * Will be passed to the @components/organisms/DropdownMenu component.
		 */
		actions: {
			type: Array,
			default: () => [],
			validator: (actions) =>
				actions.every((action) => typeof action.action === "function"),
		},

		sortBy: {
			type: String,
			default: "",
		},
		sortOrder: {
			type: String,
			default: "asc",
			validator: (val) => ["asc", "desc"].includes(val),
		},

		/**
		 * Component to use for the header. Must define the same Interface as ./TableHeadRow
		 */
		componentHeaderRow: {
			type: Object,
			default: () => TableHeadRow,
		},
		/**
		 * Component to use for each datarow. Must define the same Interface as ./TableDataRow
		 * The default component provides slots for each column with the naming schema dataColumn-[index]
		 */
		componentDataRow: {
			type: Object,
			default: () => TableDataRow,
		},
	},
	data() {
		return {
			editFilterActive: false,
			tableData: this.data,
			filterOpened: {},
			newFiltersSelected: this.filtersSelected,
			selectionKeys: {},
		};
	},
	computed: {
		columnKeys() {
			return this.columns.map((e) => e.field);
		},
		dataRowSlots() {
			// TODO configure babel to enable Object.fromEntries()
			// then replace this ugly reduce
			const fromEntries = (iterable) =>
				[...iterable].reduce((obj, [key, val]) => {
					obj[key] = val;
					return obj;
				}, {});
			return fromEntries(
				Object.entries(this.$scopedSlots).filter(([name]) =>
					name.startsWith("datacolumn")
				)
			);
		},
		sortByProxy: {
			get() {
				return this.sortBy;
			},
			set(to) {
				this.$emit("update:sortBy", to);
			},
		},
		sortOrderProxy: {
			get() {
				return this.sortOrder;
			},
			set(to) {
				this.$emit("update:sortOrder", to);
			},
		},
		numberOfSelectedItems() {
			// TODO think about moving selections outside this method
			const selections = Object.keys(this.selectionKeys);
			return this.selectionType === "inclusive"
				? selections.length
				: this.total - selections.length;
		},
		allRowsOfAllPagesSelected: {
			get() {
				// TODO think about moving selections outside this method
				const selections = Object.keys(this.selectionKeys);
				return this.selectionType === "exclusive" && selections.length === 0;
			},
			set(state) {
				state
					? this.selectAllRowsOfAllPages()
					: this.unselectAllRowsOfAllPages();
			},
		},
		allRowsOfCurrentPageSelected: {
			get() {
				const isInSelection = (row) =>
					this.selectionKeys[getValueByPath(row, this.trackBy)];
				return this.selectionType === "inclusive"
					? Boolean(this.data.every(isInSelection))
					: !Boolean(this.data.some(isInSelection));
			},
			set(state) {
				this.data.forEach((row) => {
					this.setRowSelection(row, state);
				});
			},
		},
	},
	watch: {
		selectionKeys(to) {
			this.onUpdateSelectionKeys(to);
		},
		selectedRowIds(to) {
			this.onUpdateSelectedRowIds(to);
		},
	},
	methods: {
		selectAllRowsOfAllPages() {
			this.$set(this, "selectionKeys", {});
			this.$emit("update:selectionType", "exclusive");
		},
		unselectAllRowsOfAllPages() {
			this.$set(this, "selectionKeys", {});
			this.$emit("update:selectionType", "inclusive");
		},
		setRowSelection(row, state) {
			const method = (newState) => (newState ? "$set" : "$delete");
			this[method(this.selectionType === "inclusive" ? state : !state)](
				this.selectionKeys,
				getValueByPath(row, this.trackBy),
				true
			);
		},
		isRowSelected(row) {
			const rowId = getValueByPath(row, this.trackBy);
			return Boolean(
				this.selectionType === "inclusive"
					? this.selectionKeys[rowId]
					: !this.selectionKeys[rowId]
			);
		},

		onUpdateSelectionKeys(to) {
			/**
			 * toggle whenever the selection changes
			 *
			 * @event update:selection
			 * @property {array} selectedRowIds identifiers (trackBy value) of all selected items
			 * @property {string} selectionType is the selection Array "inclusive" or "exclusive".
			 * Inclusive means all items in the passed array are selected.
			 * Exclusive means all items not in the passed array are selected.
			 */
			this.$emit("update:selection", Object.keys(to), this.selectionType);
			/**
			 * helper event for the selectedRowIds .sync modifier
			 */
			this.$emit("update:selectedRowIds", Object.keys(to));
		},
		onUpdateSelectedRowIds(to) {
			const hasSameNumberOfAttributes =
				to.length === Object.keys(this.selectionKeys).length;
			const hasSameAttributes = to.every((item) => this.selectionKeys[item]);
			if (hasSameNumberOfAttributes && hasSameAttributes) {
				// nothing to change
				return;
			}

			const newSelectionKeys = to.reduce((obj, key) => {
				obj[key] = true;
				return obj;
			}, {});

			this.$set(this, "selectionKeys", newSelectionKeys);
		},

		onUpdateRowsPerPage(value) {
			this.$emit("update:current-page", 1);
			this.$emit("update:rows-per-page", value);
		},

		getValueByPath,

		fireAction(action) {
			const selections = Object.keys(this.selectionKeys);
			action.action(selections, this.selectionType);
			this.unselectAllRowsOfAllPages();
		},
	},
};
</script>

<style lang="scss">
@import "@styles";
.table-wrapper {
	overflow-x: auto;
}
.toolbelt {
	display: flex;
	align-items: center;
	height: 55px;
}
.table {
	width: 100%;
}
</style>