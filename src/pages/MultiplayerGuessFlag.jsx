import MultiplayerGame from './MultiplayerGame'
import { flags } from '../data/questions/flags'

const flagItems = flags.map((flag) => ({
  ...flag,
  name: flag.country,
}))

export default function MultiplayerGuessFlag(props) {
  return (
    <MultiplayerGame
      {...props}
      items={flagItems}
      modeTitle="Pogodi zastavu"
      questionLabel="KOJA JE OVO ZASTAVA?"
      itemTypeLabel="zastava"
    />
  )
}