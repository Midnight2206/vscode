import TreeFolder from "/component/treefolder/TreeFolder.js";
async function getData() {
    const res = await fetch("http://localhost:3000/treeFolder/0")
    return await res.json()
}
const data = await getData()
const treeFolderRoot = document.querySelector('#tree-folder')
const tree = new TreeFolder(data, treeFolderRoot, 0 ,[], data)
tree.init()

