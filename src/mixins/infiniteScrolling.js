const infiniteScrolling = {
	data() {
		return {
			bottom: false,
			scrollY: 0,
		}
	},
	created() {
		window.scrollTo(0, 0);
		window.addEventListener("scroll", () => {
			this.bottom = this.bottomVisible();
			this.scrollY = window.scrollY;
		});
	},
	beforeDestroy() {
		window.removeEventListener("scroll", () => {
			this.bottom = this.bottomVisible();
			this.scrollY = window.scrollY;
		});
	},
	methods: {
		bottomVisible() {
			const {
				scrollY
			} = window;
			const visible = document.documentElement.clientHeight;
			const pageHeight = document.documentElement.scrollHeight;
			const bottomOfPage = visible + scrollY >= pageHeight - 2;
			return bottomOfPage || pageHeight < visible;
		},
		backToTop() {
			window.scrollTo(0, 0);
		},
	}
}

export default infiniteScrolling;
