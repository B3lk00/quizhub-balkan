export function shuffleArray(items) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))

    ;[shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ]
  }

  return shuffled
}

export function getRandomQuestions({
  questions,
  category,
  count,
  difficulty = 'all',
}) {
  const filteredQuestions = questions.filter((question) => {
    const matchesCategory =
      category === 'sve' || question.category === category

    const matchesDifficulty =
      difficulty === 'all' ||
      question.difficulty === difficulty

    return matchesCategory && matchesDifficulty
  })

  return shuffleArray(filteredQuestions).slice(0, count)
}
