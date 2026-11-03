type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void | Promise<unknown>) => {
    finished: Promise<void>
  }
}

export function runViewTransition(navigate: () => void | Promise<unknown>) {
  const transitionDocument = document as ViewTransitionDocument

  if (!transitionDocument.startViewTransition) {
    return navigate()
  }

  return transitionDocument.startViewTransition(navigate).finished
}
