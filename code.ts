// This plugin will open a tab that indicates that it will monitor the current
// selection on the page. It cannot change the document itself.

// This file holds the main code for plugins. Code in this file has access to
// the *figma document* via the figma global object.
// You can access browser APIs in the <script> tag inside "ui.html" which has a
// full browser environment (See https://www.figma.com/plugin-docs/how-plugins-run).

// This shows the HTML page in "ui.html".
figma.showUI(__html__, { themeColors: true })

// This monitors the selection changes and posts the selection to the UI
figma.on('selectionchange', () => {
  updateSelection()
})

updateSelection()

function updateSelection() {
  const selections = figma.currentPage.selection
  const selectionCharacters = getObjectFromNodes(selections)
  figma.ui.postMessage(selectionCharacters)
}

function getObjectFromNodes(nodes: readonly SceneNode[]): object[] {
  return nodes.flatMap(node => getObjectFromNode(node))
}

function getObjectFromNode(node: SceneNode): object[] {
  if (node.type === 'TEXT') {
    return [
      {
        characters: (node as TextNode).characters,
        frameName: getFrameNameFromNode(node)
      }
    ]
  } else if (node.type === 'FRAME') {
    return (node as FrameNode).children.flatMap(child => getObjectFromNode(child))
  } else if (node.type === 'INSTANCE') {
    return (node as InstanceNode).children.flatMap(child => getObjectFromNode(child))
  } else if (node.type === 'GROUP') {
    return (node as GroupNode).children.flatMap(child => getObjectFromNode(child))
  } else {
    return []
  }
}

function getFrameNameFromNode(node: SceneNode): String {
  if (node.type === 'FRAME' && node.parent?.type === 'PAGE') {
    return node.name
  } else if (node && node.parent) {
    return getFrameNameFromNode(node.parent as SceneNode)
  } else {
    return ''
  }
}