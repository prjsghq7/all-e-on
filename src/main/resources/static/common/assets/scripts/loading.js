export class Loading {
    #$element;
    #$caption;

    constructor() {
        this.#$element = document.createElement('div');
        this.#$element.dataset.aeoObject = "loading";
        this.#$element.setVisible(false); // 초기 숨김

        const $icon = document.createElement('img');
        $icon.dataset.aeoComponent = "loading.icon";
        // 테스트용 임시 이미지
        $icon.src = '/common/assets/images/button-images/check.png';

        this.#$caption = document.createElement('span');
        this.#$caption.dataset.aeoComponent = "loading.caption";
        this.#$caption.textContent = '잠시만 기다려주세요.';

        this.#$element.append($icon, this.#$caption);
        document.body.appendChild(this.#$element);
    }

    /**
     * 로딩 표시
     * @param {string} message
     */
    show(message = '잠시만 기다려주세요.') {
        this.#$caption.textContent = message;
        this.#$element.setVisible(true);
    }

    /**
     * 로딩 숨김
     */
    hide() {
        this.#$element.setVisible(false);
    }

    /**
     * 로딩 표시 여부
     * @returns {boolean}
     */
    isVisible() {
        return this.#$element.isVisible();
    }
}
