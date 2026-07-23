import MultiplayerGame from './MultiplayerGame'
import { logos } from '../data/questions/logos'

function MultiplayerGuessLogo(props) {
  return (
    <MultiplayerGame
      {...props}
      items={logos}
      modeTitle="Pogodi logo"
      questionLabel="KOJI JE OVO LOGO?"
      itemTypeLabel="logotipa"
    />
  )
}

export default MultiplayerGuessLogo