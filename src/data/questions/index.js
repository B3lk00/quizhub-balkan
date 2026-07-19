import { opceQuestions } from './opce'
import { geografijaQuestions } from './geografija'
import { sportQuestions } from './sport'
import { automobiliQuestions } from './automobili'
import { filmoviSerijeQuestions } from './filmovi'
import { muzikaQuestions } from './muzika'

export const allQuestions = [
  ...opceQuestions,
  ...geografijaQuestions,
  ...sportQuestions,
  ...automobiliQuestions,
  ...filmoviSerijeQuestions,
  ...muzikaQuestions,
]

export {
  opceQuestions,
  geografijaQuestions,
  sportQuestions,
  automobiliQuestions,
  filmoviSerijeQuestions,
  muzikaQuestions,
}