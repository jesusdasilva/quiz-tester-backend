import firestore from '../src/config/database';

interface QuestionDoc {
  id: string;
  topic_id: string;
  createdAt?: any;
}

async function main() {
  const questionsRef = firestore.collection('questions');
  const snapshot = await questionsRef.get();
  const questions: QuestionDoc[] = [];

  snapshot.forEach(doc => {
    const data = doc.data();
    questions.push({
      id: doc.id,
      topic_id: data.topic_id,
      createdAt: data.createdAt || null
    });
  });

  // Agrupar por topic_id
  const grouped: Record<string, QuestionDoc[]> = {};
  for (const q of questions) {
    if (!grouped[q.topic_id]) grouped[q.topic_id] = [];
    grouped[q.topic_id].push(q);
  }

  // Para cada grupo, ordenar por createdAt y asignar number
  for (const topicId of Object.keys(grouped)) {
    const group = grouped[topicId];
    group.sort((a, b) => {
      if (!a.createdAt) return 1;
      if (!b.createdAt) return -1;
      const aDate = a.createdAt._seconds ? new Date(a.createdAt._seconds * 1000) : new Date(a.createdAt);
      const bDate = b.createdAt._seconds ? new Date(b.createdAt._seconds * 1000) : new Date(b.createdAt);
      return aDate.getTime() - bDate.getTime();
    });
    for (let i = 0; i < group.length; i++) {
      const q = group[i];
      const number = i + 1;
      await questionsRef.doc(q.id).update({ number });
      console.log(`Pregunta ${q.id} del topic ${topicId} actualizada con number = ${number}`);
    }
  }

  console.log('Actualización de números completada.');
}

main().catch(err => {
  console.error('Error actualizando números de preguntas:', err);
  process.exit(1);
}); 