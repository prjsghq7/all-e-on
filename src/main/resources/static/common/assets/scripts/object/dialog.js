class Dialog {
    #$element;
    #$modals = [];

    constructor() {
        this.#$element = document.body.querySelector('[data-aeo-object="dialog"]');
        if (this.#$element == null) {
            this.#$element = document.createElement('div');
            this.#$element.setAttribute('data-aeo-object', 'dialog');
            document.body.insertAdjacentElement('afterbegin', this.#$element);
        }
    }

    /**
     * @param {HTMLElement} $modal
     * @return {boolean}
     */
    hide($modal) {
        $modal.setVisible(false);
        const index = this.#$modals.indexOf($modal);
        if (index === -1) {
            return false;
        }
        this.#$modals.splice(index, 1);
        if (this.#$modals.length === 0) {
            this.#$element.setVisible(false);
        }
        setTimeout(() => $modal.remove(), 1000);
        return true;
    }

    /**
     * 모달 표시
     * @param {{
     *  title: string,
     *  content: string,
     *  buttons?: {caption: string, color?: 'gray'|'green'|'red', onClickCallback: function(HTMLElement?)}[],
     *  isContentHtml?: boolean
     * }} args
     * @return {HTMLElement}
     */
    show(args) {
        const $modal = document.createElement('div');
        $modal.setAttribute('data-aeo-component', 'dialog.modal');

        const $title = document.createElement('div');
        $title.setAttribute('data-aeo-component', 'dialog.modal.title');
        $title.innerText = args.title;

        const $content = document.createElement('div');
        $content.setAttribute('data-aeo-component', 'dialog.modal.content');
        if (args.isContentHtml) {
            $content.innerHTML = args.content;
        } else {
            $content.innerText = args.content;
        }

        $modal.append($title, $content);

        if (args.buttons && args.buttons.length > 0) {
            const $buttonContainer = document.createElement('div');
            $buttonContainer.setAttribute('data-aeo-component', 'dialog.modal.buttonContainer');

            for (const button of args.buttons) {
                const $button = document.createElement('button');
                $button.setAttribute('data-aeo-object', 'button');
                $button.setAttribute('data-aeo-component', 'dialog.modal.buttonContainer.button');
                $button.setAttribute('data-aeo-color', button.color ?? 'green');
                $button.setAttribute('type', 'button');
                $button.innerText = button.caption;

                $button.addEventListener('click', () => {
                    if (typeof button.onClickCallback === 'function') {
                        button.onClickCallback($modal);
                    }
                });
                $buttonContainer.append($button);
            }

            $modal.append($buttonContainer);
        }

        this.#$element.append($modal);
        this.#$element.setVisible(true);
        this.#$modals.push($modal);

        setTimeout(() => $modal.setVisible(true), 50);

        return $modal;
    }

    /**
     * @param {string} title
     * @param {string} content
     * @param {function(HTMLElement?)|undefined} onclick
     * @return {HTMLElement}
     */
    showSimpleOk(title, content, onclick = undefined) {
        return this.show({
            title: title,
            content: content,
            buttons: [
                {
                    caption: '확인',
                    color: 'green',
                    onClickCallback: ($modal) => {
                        if (typeof onclick === 'function') {
                            onclick($modal);
                        }
                        this.hide($modal);
                    }
                }
            ]
        });
    }
}

const dialog = new Dialog();
