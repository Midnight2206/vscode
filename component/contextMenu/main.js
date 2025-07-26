import './contextMenu.js'
import './contextMenuItem.js'
const menuData = [
    {
        label: "New file"
    },
    {
        label: "New Folder"
    },
    {
        label: "Rename"
    },
    {
        label: "Delete"
    },
    {
        label: "Coppy",
        children: [
            {
                label: "Coppy code"
            },
            {
                label: "Coppy file"
            }, 
            {
                label: "Coppy path",
                children: [
                    {label: "11111"}
                ]
            }
        ]
    }
]

    const contextMenu = document.querySelector('context-menu')
    contextMenu.data = menuData