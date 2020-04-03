import { store } from '../store'

// constants
import {
  RANKED_ROOT,
  ROOT_TOKEN,
} from '../constants'

// util
import {
  contextChainToPath,
  equalArrays,
  equalThoughtRanked,
  getContexts,
  getContextsSortedAndRanked,
  getThought,
  head,
  headValue,
  isContextViewActive,
  isRoot,
  splitChain,
  unroot,
} from '../util'

// selectors
import getThoughtsRanked from '../selectors/getThoughtsRanked'

/** Ranks the thoughts from their rank in their context. */
// if there is a duplicate thought in the same context, takes the first
// NOTE: path is pathToContexted
export const rankThoughtsFirstMatch = (pathUnranked, { state = store.getState() } = {}) => {
  if (isRoot(pathUnranked)) return RANKED_ROOT

  const { thoughtIndex } = state
  let thoughtsRankedResult = RANKED_ROOT // eslint-disable-line fp/no-let
  let prevParentContext = [ROOT_TOKEN] // eslint-disable-line fp/no-let

  return pathUnranked.map((value, i) => {
    const thought = getThought(value, thoughtIndex)
    const contextPathUnranked = i === 0 ? [ROOT_TOKEN] : pathUnranked.slice(0, i)
    const contextChain = splitChain(thoughtsRankedResult, { state })
    const thoughtsRanked = contextChainToPath(contextChain)
    const context = unroot(prevParentContext).concat(headValue(thoughtsRanked))
    const inContextView = i > 0 && isContextViewActive(contextPathUnranked, { state })
    const contexts = (inContextView ? getContextsSortedAndRanked : getContexts)(
      inContextView
        ? head(contextPathUnranked)
        : value,
      thoughtIndex
    )

    const parents = inContextView
      ? contexts.filter(child => head(child.context) === value)
      : ((thought && thought.contexts) || []).filter(p => equalArrays(p.context, context))

    const contextThoughts = parents.length > 1 && getThoughtsRanked(state, thoughtsRankedResult)

    // there may be duplicate parents that are missing from contextIndex
    // in this case, find the matching thought
    const parent = parents.length <= 1
      ? parents[0]
      : parents.find(parent => contextThoughts.some(thoughtRanked => equalThoughtRanked(
        thoughtRanked,
        {
          value,
          rank: parent.rank
        }
      )))

    if (parent && parent.context) {
      prevParentContext = parent.context
    }

    const thoughtRanked = {
      value,
      // NOTE: we cannot throw an error if there is no parent, as it may be a floating context
      // unfortunately this that there is no protection against a (incorrectly) missing parent
      rank: parent ? parent.rank : 0
    }

    thoughtsRankedResult = unroot(thoughtsRankedResult.concat(thoughtRanked))

    return thoughtRanked
  })
}
