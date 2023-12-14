import _ from 'lodash'
import { THROTTLE_DISTRACTION_FREE_TYPING } from '../constants'
import reactMinistore from './react-ministore'

/** Hides the toolbar and nav bar to allow for distraction-free typing on desktop. */
const store = reactMinistore<boolean>(false)
const distractionFreeTypingStore = {
  ...store,
  updateThrottled: _.throttle(store.update, THROTTLE_DISTRACTION_FREE_TYPING, { leading: false }),
}

export default distractionFreeTypingStore
