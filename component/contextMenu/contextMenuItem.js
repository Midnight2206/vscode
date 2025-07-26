class ContextMenuItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  connectedCallback() {
    this.shadowRoot.innerHTML = `
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v6.5.0/css/all.css">
    <style>
      :host {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 12px;
        width: 100%;
        cursor: pointer;
      }
      
    </style>
    <slot></slot>
  `;
  }
  disconnectedCallback() {}
}
export default customElements.define("context-menu-item", ContextMenuItem);
