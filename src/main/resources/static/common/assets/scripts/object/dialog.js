export class Dialog {
    // export 는 dialog 클래스 전체를 모듈로 사용하겠다.
    /**
     * @type {HTMLElement}
     */
    #$element;
    /**
     *  @type {HTMLElement}
     */
    #$modals = [];

    /**
     * @param {{$element: HTMLElement}} args
     */
    constructor(args) {
        this.#$element = args.$element;
    }

    hide = ($modal) => {
        const index = this.#$modals.indexOf($modal);
        if (index < 0) {
            return;
        }
        this.#$modals.splice(index, 1);
        if (this.#$modals.length === 0) {
            this.#$element.setVisible(false);
        }
        $modal.setVisible(false);
        setTimeout(() => $modal.remove(), 1000);
    }

    /**
     * @param {{
     * title : string, content: string, isContentHtml?: boolean, delay?: number, buttons: {caption: string, color: 'gray'|'green'|'red', onClickCallback: function(HTMLElement)}[]}} args
     */
    show = (args) => {
        const $modal = document.createElement('div');
        $modal.setAttribute('data-aeo-component', 'dialog.modal');
        const $title = document.createElement('div');
        $title.setAttribute('data-aeo-component', 'dialog.modal.title');
        $title.innerText = args.title;
        const $content = document.createElement('div');
        $content.setAttribute('data-aeo-component', 'dialog.modal.content');
        if (args.isContentHtml === true) {
            $content.innerHTML = args.content;
        } else {
            $content.innerText = args.content;
        }
        const $buttonContainer = document.createElement('div');
        $buttonContainer.setAttribute('data-aeo-component', 'dialog.modal.buttonContainer');

        $buttonContainer.append(...args.buttons.map((button) => { // ...을 붙이면 배열 하나를 밑에서
            const $button = document.createElement('button');
            $button.addEventListener('click', () => button.onClickCallback($modal));
            $button.setAttribute('data-aeo-object', 'button');
            $button.setAttribute('data-aeo-component', 'dialog.modal.buttonContainer.button');
            $button.setAttribute('data-aeo-color', 'green');
            $button.innerText = button.caption;
            return $button;
        }));
        $modal.append($title, $content, $buttonContainer);
        this.#$element.append($modal);
        this.#$element.setVisible(true);
        this.#$modals.push($modal);
        setTimeout(() => $modal.setVisible(true), args.delay ?? 25);
        return $modal;
    }

    /**
     *
     * @param {string} title
     * @param {string} content
     * @param {{delay?: number, isContentHtml?: boolean, onClickCallback?: function(HTMLElement)}?} args
     */
    showSimpleOk = (title, content, args = {}) => {
        return this.show({
            title: title,
            content: content,
            delay: args?.delay,
            isContentHtml: args?.isContentHtml,
            buttons: [
                {
                    caption: '확인',
                    color: 'green',
                    onClickCallback: ($modal) => {
                        this.hide($modal);
                        args?.onClickCallback?.($modal);
                    }
                }
            ]
        });
    }
}

