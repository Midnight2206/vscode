const template = document.createElement("template");
template.innerHTML = `
  <style>
    * {
      box-sizing: border-box;
    }

    :host {
      position: absolute;
      z-index: 9999;
      width: 200px;
      background-color: #666;
      border-radius: 8px;
      visibility: hidden;
      opacity: 0;
      transform: scale(0.95);
      transition: 
        opacity 150ms ease,
        transform 150ms ease,
        visibility 0s linear 150ms;
      pointer-events: none;
    }

    :host(.visible) {
      visibility: visible;
      opacity: 1;
      transform: scale(1);
      transition: 
        opacity 150ms ease,
        transform 150ms ease,
        visibility 0s linear 0s;
      pointer-events: auto;
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      cursor: pointer;
      white-space: nowrap;
      position: relative;
    }

    context-menu-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: #444;
      color: white;
      transition: background 0.2s;
    }

    li:hover context-menu-item {
      background-color: #888;
    }

    ul li:first-child context-menu-item {
      border-radius: 8px 8px 0 0;
    }

    ul li:last-child context-menu-item {
      border-radius: 0 0 8px 8px;
    }

    i {
      margin-left: 10px;
      font-size: 12px;
    }
  </style>
`;

class ContextMenu extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._data = [];
    this._path = [];
    this._parent = null;
    this.handleHover = this.handleHover.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  connectedCallback() {
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.shadowRoot.addEventListener("mouseover", this.handleHover);
    this.shadowRoot.addEventListener("click", this.handleClick);
    if (this._data.length) this.renderMenu();
  }

  disconnectedCallback() {
    this.shadowRoot.removeEventListener("mouseover", this.handleHover);
    this.shadowRoot.removeEventListener("click", this.handleClick);
  }

  set data(value) {
    this._data = value;
    if (this.isConnected) this.renderMenu();
  }

  set path(value) {
    this._path = value;
  }
  set parent(value) {
    this._parent = value;
  }
  get parent() {
    return this._parent;
  }
  renderMenu() {
    const oldUl = this.shadowRoot.querySelector("ul");
    if (oldUl) oldUl.remove();

    const ul = document.createElement("ul");

    this._data.forEach((item) => {
      const li = document.createElement("li");

      const menuItem = document.createElement("context-menu-item");
      const currentPath = [...this._path, item.label];
      item.path = currentPath;

      menuItem.data = item;
      menuItem.innerHTML = `
        <span>${item.label}</span>
        ${item.children ? '<i class="fa-solid fa-chevron-right"></i>' : ""}
      `;
      li.appendChild(menuItem);
      ul.appendChild(li);

      if (item.children) {
        const subMenu = document.createElement("context-menu");
        subMenu.path = currentPath;
        subMenu.data = item.children;
        subMenu.parent = this;
        li.appendChild(subMenu);
      }
    });
    this.shadowRoot.appendChild(ul);
  }

  show({
    horizontal = { origin: "left", gap: 0, direction: undefined },
    vertical = { origin: "top", gap: 0, direction: undefined },
  }) {
    this.classList.add("visible");

    const applyPosition = (origin, gap, direction, axis) => {
      if (!direction) {
        if (axis === "X") {
          this.style.left = "50%";
          this.style.transform = "translateX(-50%)";
        } else {
          this.style.top = "50%";
          this.style.transform = "translateY(-50%)";
        }
        return;
      }

      const start = direction.split("-")[0];
      if (start === origin) {
        this.style[start] = `${gap}px`;
      } else {
        this.style[start] = `calc(100% + ${gap}px)`;
        this.style[origin] = "";
      }
    };

    applyPosition(horizontal.origin, horizontal.gap, horizontal.direction, "X");
    applyPosition(vertical.origin, vertical.gap, vertical.direction, "Y");
  }

  hide() {
    this.classList.remove("visible");
    this.shadowRoot
      .querySelectorAll("context-menu")
      .forEach((sub) => sub.hide());
  }
  hideAll() {
    this.hide();
    if (this.parent) this.parent.hideAll();
  }

  handleHover(e) {
    const li = e.target.closest("li");
    if (!li) return;
    this.shadowRoot
      .querySelectorAll("context-menu")
      .forEach((sub) => sub.hide());

    const subMenu = li.querySelector("context-menu");
    if (subMenu) {
      subMenu.show({
        horizontal: {
          origin: "right",
          gap: 0,
          direction: "left-to-right",
        },
        vertical: {
          origin: "top",
          gap: 0,
          direction: "top-to-bottom",
        },
      });
    }
  }

  handleClick(e) {
    const itemEl = e.target.closest("context-menu-item");
    if (!itemEl || !itemEl.data) return;
    if (!itemEl.data.action) return;
    const { path, children } = itemEl.data;
    if (children) return;

    this.dispatchEvent(
      new CustomEvent("menu-select", {
        detail: { path, data: itemEl.data },
        bubbles: true,
        composed: true,
      })
    );

    this.hideAll();
  }
}

customElements.define("context-menu", ContextMenu);
