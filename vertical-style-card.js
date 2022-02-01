class VerticalStyleCard extends HTMLElement {
    constructor() {
        super();
        // Make use of shadowRoot to avoid conflicts when reusing
        this.attachShadow({ mode: 'open' });
    }
    setConfig(config) {
        if (!config || !config.cards || !Array.isArray(config.cards)) {
            throw new Error('Card config incorrect');
        }
        const cardConfig = Object.assign({}, config);
		cardConfig.style = Object.assign({}, config.style);
	
		var prop = {  "border": null  , "background_color":null , "font_size":null}  ;
		
		var cardSize = Object.keys(cardConfig.style);
		
		if (cardSize.length == 0) Object.assign(cardConfig.style, prop);

		if (cardConfig.style.border === undefined || cardConfig.style.border == null ) cardConfig.style.border = true;
		if (!cardConfig.style.background_color || cardConfig.style.background_color == null ) cardConfig.style.background_color = 'var(--paper-card-background-color)';
		if (!cardConfig.style.font_size || cardConfig.style.font_size == null ) cardConfig.style.font_size = 'var(--paper-font-headline_-_font-size)';
        if (!cardConfig.style.borderRadius || cardConfig.style.borderRadius == null ) cardConfig.style.borderRadius = '20px';
        if (!cardConfig.style.firstShadowAlpha || cardConfig.style.firstShadowAlpha == null ) cardConfig.style.firstShadowAlpha = '0.14';
        if (!cardConfig.style.secondShadowAlpha || cardConfig.style.secondShadowAlpha == null ) cardConfig.style.secondShadowAlpha = '0.12';
        if (!cardConfig.style.thirdShadowAlpha || cardConfig.style.thirdShadowAlpha == null ) cardConfig.style.thirdShadowAlpha = '0.15';
        if (!cardConfig.style.padding || cardConfig.style.padding == null ) cardConfig.style.padding = '5px';

		this.style.background = cardConfig.style.background_color;
		this.style.padding = cardConfig.style.padding + ' ' + cardConfig.style.padding + ' ' + cardConfig.style.padding + ' ' + cardConfig.style.padding;

		if (cardConfig.style.border == true){
			this.style.boxShadow = '0 2px 2px 0 rgba(0, 0, 0, ' + cardConfig.style.firstShadowAlpha + '), 0 1px 5px 0 rgba(0, 0, 0, ' + cardConfig.style.secondShadowAlpha + '), 0 3px 1px -2px rgba(0, 0, 0, ' + cardConfig.style.thirdShadowAlpha + ')';
			this.style.borderRadius = cardConfig.style.borderRadius;
		}

        const root = this.shadowRoot;
        while (root.lastChild) {
            root.removeChild(root.lastChild);
        }

        this._refCards = [];
        if (config.title) {
            const title = document.createElement("div");
            title.className = "header";
            title.style = "font-family: var(--paper-font-headline_-_font-family); -webkit-font-smoothing: var(--paper-font-headline_-_-webkit-font-smoothing); font-size: " + cardConfig.style.font_size + "; font-weight: var(--paper-font-headline_-_font-weight); letter-spacing: var(--paper-font-headline_-_letter-spacing); line-height: var(--paper-font-headline_-_line-height);text-rendering: var(--paper-font-common-expensive-kerning_-_text-rendering);opacity: var(--dark-primary-opacity);padding: 5px 16px 10px 16px";
            title.innerHTML = '<div class="name">' + config.title + '</div>';
            root.appendChild(title);
        }
        let element;
        config.cards.forEach(item => {
            if (item.type.startsWith("custom:")){
                element = document.createElement(`${item.type.substr("custom:".length)}`);
            } else {
                element = document.createElement(`hui-${item.type}-card`);
            }
            if (element.setConfig != undefined)
                element.setConfig(item);
            root.appendChild(element);
            this._refCards.push(element);
        });
    }

    set hass(hass) {
        if (this._refCards) {
            this._refCards.forEach((card) => {
                card.hass = hass;
            });
        }
    }

    connectedCallback() {
        this._refCards.forEach((element) => {
            let fn = () => {
                this._card(element);
            };

            if(element.updateComplete) {
                element.updateComplete.then(fn);
            } else {
                fn();
            }
        });
    }

    _card(element) {
        if (element.shadowRoot) {
            if (!element.shadowRoot.querySelector('ha-card')) {
                let searchEles = element.shadowRoot.getElementById("root");
                if (!searchEles) {
                    searchEles = element.shadowRoot.getElementById("card");
                }
                if (!searchEles) return;
                searchEles = searchEles.childNodes;
                for (let i = 0; i < searchEles.length; i++) {
                    if(searchEles[i].style !== undefined){
                        searchEles[i].style.margin = "2px";
                    }
                    this._card(searchEles[i]);
                }
            } else {
                element.shadowRoot.querySelector('ha-card').style.boxShadow = 'none';
            }
        } else {
            if (typeof element.querySelector === 'function' && element.querySelector('ha-card')) {
                element.querySelector('ha-card').style.boxShadow = 'none';
            }
            let searchEles = element.childNodes;
            for (let i = 0; i < searchEles.length; i++) {
                if (searchEles[i] && searchEles[i].style) {
                    searchEles[i].style.margin = "2px";
                }
                this._card(searchEles[i]);
            }
        }
    }
    
    getCardSize() {
        let totalSize = 0;
        this._refCards.forEach((element) => {
            totalSize += typeof element.getCardSize === 'function' ? element.getCardSize() : 1;
        });
        return totalSize;
    }
}

customElements.define('vertical-style-card', VerticalStyleCard);
