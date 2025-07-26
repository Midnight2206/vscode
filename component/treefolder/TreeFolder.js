import "../contextMenu/contextMenu.js";
import "../contextMenu/contextMenuItem.js";
const contextMenuFolder = [
  {
    label: "New file",
    action: "createNewFile",
  },
  {
    label: "New Folder",
    action: "createNewFolder",
  },
  {
    label: "Rename",
    action: "rename",
  },
  {
    label: "Delete",
    action: "delete",
  },
  {
    label: "Copy",
    action: "copy",
  },
];
const contextMenuFile = [
  {
    label: "Rename",
    action: "rename",
  },
  {
    label: "Delete",
    action: "delete",
  },
  {
    label: "Copy",
    children: [
      {
        label: "Copy code",
        action: "copyCode",
      },
      {
        label: "Copy file",
        action: "copy",
      },
      {
        label: "Copy path",
        action: "copyPath",
      },
    ],
  },
];
export default class TreeFolder {
  constructor(data, container, lv = 0, pathData, rootData) {
    this.rootData = rootData;
    this.pathData = pathData;
    this.data = data;
    this.container = container;
    this.lv = lv;
    this.toggleOpenFolder = this.toggleOpenFolder.bind(this);
    this.showContextMenu = this.showContextMenu.bind(this);
    this.hideContextMenu = this.hideContextMenu.bind(this);
    this.handleMenu = {
      createNewFolder: this.createNewNode.bind(this, "folder"),
      createNewFile: this.createNewNode.bind(this, "file"),
      rename: this.rename.bind(this),
      // copy: this.copy.bind(this),
      // copyCode: this.copyCode.bind(this),
      // copyPath: this.copyPath.bind(this),
      delete: this.delete.bind(this)
    };
  }

  init() {
    this.render();
  }
  setData(data) {
    this.data = data;
    this.render();
  }
  render() {
    this.container.innerHTML = "";
    if (this.data.root) {
      this.renderHeader();
      this.container.classList.add("treefolder-open-children");
      this.container.addEventListener("click", this.toggleOpenFolder);
      this.container.addEventListener("contextmenu", this.showContextMenu);
    } else {
      const isFolder = this.data.type === "folder";
      this.item = document.createElement("div");
      this.item.contextMenu = document.createElement("context-menu");
      this.item.wrapperContextMenu = document.createElement("div");
      this.item.wrapperContextMenu.style.position = "fixed";
      this.item.contextMenu.data = isFolder
        ? contextMenuFolder
        : contextMenuFile;
      this.item.contextMenu.addEventListener("menu-select", (e) => {
        if (e.detail && e.detail.data.action) {
          this.handleMenu[e.detail.data.action]();
        }
      });
      this.item.classList.add("treefolder-item-title");
      this.item.instance = this;
      const indent = document.createElement("div");
      indent.classList.add("treefolder-item-indent");
      indent.style.width = `${this.lv}px`;
      indent.style.height = "100%";
      indent.style.flexShrink = 0;
      indent.style.borderRight = "1px solid #ccc";
      const iconBox = document.createElement("div");
      iconBox.classList.add("treefolder-item-icon");

      if (isFolder) iconBox.classList.add("folder-icon");
      this.item.icon = document.createElement("i");
      this.item.icon.className = this.getFileIcon(this.data.type);
      iconBox.appendChild(this.item.icon);

      this.item.name = document.createElement("input");
      this.item.name.value = this.data.name;
      this.item.name.dataset.isDisable = "true";
      this.item.appendChild(indent);
      this.item.appendChild(iconBox);
      this.item.appendChild(this.item.name);
      this.item.wrapperContextMenu.appendChild(this.item.contextMenu);
      document.body.appendChild(this.item.wrapperContextMenu);
      this.container.appendChild(this.item);
    }
    if (this.data.children) {
      this.childrenContainer = document.createElement("div");
      this.childrenContainer.classList.add("treefolder-children");
      for (const [index, child] of this.data.children.entries()) {
        this.childWrapper = document.createElement("div");
        this.childWrapper.classList.add("treefolder-child");
        this.childTree = new TreeFolder(
          child || [],
          this.childWrapper,
          this.lv + 12,
          [...this.pathData, index],
          this.rootData
        );
        this.childTree.init();

        this.childrenContainer.appendChild(this.childWrapper);
      }

      this.container.appendChild(this.childrenContainer);
    }
  }

  renderHeader() {
    const header = document.createElement("div");
    header.classList.add("tree-header");

    header.innerHTML = `
      <div class="folder-name">
        <i class="fa-solid fa-chevron-down toggle-icon"></i>
        <span>${this.data.root}</span>
      </div>
      <div class="folder-action">
        <button class="action-btn"><i class="fa-solid fa-file-circle-plus"></i></button>
        <button class="action-btn"><i class="fa-solid fa-folder-plus"></i></button>
        <button class="action-btn"><i class="fa-solid fa-minus-square"></i></button>
      </div>
    `;

    const icon = header.querySelector(".toggle-icon");
    icon.addEventListener("click", () => {
      const childrenEl = this.container.querySelector(".treefolder-children");
      if (childrenEl) {
        childrenEl.classList.toggle("hidden");
        icon.classList.toggle("fa-chevron-down");
        icon.classList.toggle("fa-chevron-right");
      }
    });

    this.container.appendChild(header);
  }
  getFileIcon(type) {
    switch (type) {
      case "folder":
        return "fa-solid fa-chevron-right";
      case "js":
        return "fa-brands fa-js";
      case "html":
        return "fa-brands fa-html5";
      case "css":
        return "fa-brands fa-css3-alt";
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
        return "fa-regular fa-image";
      case "txt":
        return "fa-regular fa-file-lines";
      default:
        return "fa-regular fa-file";
    }
  }
  toggleOpenFolder(e) {
    const item = e.target.closest(".treefolder-item-title");
    if (item && item.instance && !item.name.classList.contains("editting")) {
      item.instance.container.classList.toggle("treefolder-open-children");
    }
  }
  showContextMenu(e) {
    e.stopPropagation();
    e.preventDefault();
    const item = e.target.closest(".treefolder-item-title");
    if (!item) return;
    item.classList.add("focus");
    if (this.focusItem) {
      this.focusItem.classList.remove("focus");
      this.focusItem.contextMenu.hide();
    }
    this.focusItem = item;
    item.wrapperContextMenu.style.top = `${e.clientY}px`;
    item.wrapperContextMenu.style.left = `${e.clientX}px`;
    if (!item) return;
    item.contextMenu.show({
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
    document.addEventListener("click", this.hideContextMenu, { once: true });
    document.addEventListener("contextmenu", this.hideContextMenu, {
      once: true,
    });
  }
  hideContextMenu(e) {
    if (!this.focusItem) return;
    const menuWrapper = this.focusItem.wrapperContextMenu;
    if (!menuWrapper.contains(e.target)) {
      this.focusItem.contextMenu.hide();
      this.focusItem.classList.remove("focus");
      this.focusItem = null;
    } else {
      document.addEventListener("click", this.hideContextMenu, { once: true });
      document.addEventListener("contextmenu", this.hideContextMenu, {
        once: true,
      });
    }
  }
  createNewNode(typeNode) {
    this.container.classList.add("treefolder-open-children");
    this.childWrapper = document.createElement("div");
    this.childWrapper.classList.add("treefolder-child");
    const item = document.createElement("div");
    item.classList.add("treefolder-item-title");
    const indent = document.createElement("div");
    indent.classList.add("treefolder-item-indent");
    indent.style.width = `${this?.childTree?.lv}px`;
    indent.style.height = "100%";
    indent.style.flexShrink = 0;
    indent.style.borderRight = "1px solid #ccc";
    const iconBox = document.createElement("div");
    iconBox.classList.add("treefolder-item-icon");
    if (typeNode === "folder") iconBox.classList.add("folder-icon");
    const icon = document.createElement("i");
    icon.className =
      typeNode === "folder"
        ? "fa-solid fa-chevron-right toggle-icon"
        : "fa-regular fa-file";
    iconBox.appendChild(icon);
    const name = document.createElement("input");
    item.appendChild(indent);
    item.appendChild(iconBox);
    item.appendChild(name);
    name.classList.add("editting");
    this.childWrapper.appendChild(item);
    this.childrenContainer.appendChild(this.childWrapper);
    name.focus();
    this.listenInput(
      name,
      "",
      typeNode,
      ({ value, type }) => {
        const newData = {
          name: value,
          type: type,
        };
        const parentArray = this.pathData.reduce(
          (acc, key) => acc?.[key].children,
          this.rootData.children
        );
        parentArray.push(newData);
        fetch("http://localhost:3000/treeFolder/0", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.rootData),
        })
          .then(() => this.render())
          .catch(() => alert("lỗi"));
      },
      () => {
        this.childrenContainer.removeChild(this.childWrapper);
      },
      icon
    );
  }
  listenInput(inputTag, originValue, typeNode, onDone, onCancel, icon) {
    const getValueInfo = () => {
      const value = inputTag.value.trim() || "";
      if (!value || value === originValue) return { value: null, type: null };
      if (typeNode === "file") {
        const lastDot = value.lastIndexOf(".");
        const ext = lastDot > 0 ? value.slice(lastDot + 1) : "";
        return { value, type: ext };
      }
      return { value, type: typeNode };
    };

    const finalize = () => {
      const { value, type } = getValueInfo();
      cleanup();
      if (value === originValue || value === null || type === null) {
        onCancel?.();
      } else {
        onDone({ value, type });
      }
    };

    const handleOutsideClick = (e) => {
      if (!inputTag.contains(e.target)) {
        finalize();
      }
    };

    const handleKeydown = (e) => {
      if (e.key === "Enter") finalize();
      if (e.key === "Escape") {
        cleanup();
        onCancel?.();
      }
    };
    const updateIcon = () => {
      const { type } = getValueInfo();
      icon.className = this.getFileIcon(type);
    };
    const cleanup = () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      inputTag.removeEventListener("keydown", handleKeydown);
      inputTag.removeEventListener("input", updateIcon);
    };
    inputTag.addEventListener("input", updateIcon);
    inputTag.addEventListener("keydown", handleKeydown);
    setTimeout(
      () => document.addEventListener("mousedown", handleOutsideClick),
      0
    );
  }
  rename() {
    const item = this.item
    item.name.dataset.isDisable = "false";
    item.name.classList.add("editting");
    item.name.select();
    item.name.focus();
    this.listenInput(
      item.name,
      item.name.value,
      this.data.type,
      ({ value, type }) => {
        const currentData = this.pathData.reduce(
          (acc, key) => acc.children?.[key],
          this.rootData
        );
        currentData.name = value;
        currentData.type = type;
        console.log(currentData);
        
        fetch("http://localhost:3000/treeFolder/0", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(this.rootData),
        })
          .then(() => this.render())
          .catch(() => alert("lỗi"));
      },
      () => {
        item.name.dataset.isDisable = "true";
        item.name.classList.remove("editting");
        item.name.setSelectionRange(0, 0)
        item.name.blur()
      },
      item.icon
    );
  }
  delete() {
    
  }
}
