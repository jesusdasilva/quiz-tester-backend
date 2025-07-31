import firestore from '../src/config/database';

const TARGET_TOPIC_ID = 'bW3pB7PgJcRW6Fpk1KRB';

async function fixCorrectAnswersForTopic() {
  try {
    console.log(`🔄 Iniciando ajuste de correct_answers para el tema ${TARGET_TOPIC_ID}...\n`);
    
    // Obtener todas las preguntas del tema específico
    const questionsSnapshot = await firestore
      .collection('questions')
      .where('topic_id', '==', TARGET_TOPIC_ID)
      .get();
    
    if (questionsSnapshot.empty) {
      console.log(`📝 No se encontraron preguntas para el tema ${TARGET_TOPIC_ID}`);
      return;
    }
    
    console.log(`📊 Total de preguntas encontradas para el tema: ${questionsSnapshot.size}\n`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let debugCount = 0;
    
    for (const doc of questionsSnapshot.docs) {
      try {
        const questionId = doc.id;
        const questionData = doc.data();
        
        // Verificar si tiene correct_answers
        if (!questionData.correct_answers || !Array.isArray(questionData.correct_answers)) {
          console.log(`⏭️  Pregunta ${questionId} no tiene correct_answers válidas, saltando...`);
          skippedCount++;
          continue;
        }
        
        const currentCorrectAnswers = questionData.correct_answers;
        
        // Mostrar información de debug para las primeras 5 preguntas
        if (debugCount < 5) {
          console.log(`🔍 Debug pregunta ${questionId}:`);
          console.log(`  - Correct answers: [${currentCorrectAnswers.join(', ')}]`);
          debugCount++;
        }
        
        // Verificar si las correct_answers ya están ajustadas (si todos los valores son >= 0)
        const allGreaterThanOrEqualZero = currentCorrectAnswers.every((answer: number) => answer >= 0);
        
        if (!allGreaterThanOrEqualZero) {
          console.log(`⏭️  Pregunta ${questionId} tiene valores negativos en correct_answers, saltando...`);
          skippedCount++;
          continue;
        }
        
        // Verificar si hay algún valor que sea 0 (ya está en el formato correcto)
        const hasZeroValue = currentCorrectAnswers.some((answer: number) => answer === 0);
        
        if (hasZeroValue) {
          console.log(`⏭️  Pregunta ${questionId} ya tiene correct_answers en formato 0-based, saltando...`);
          skippedCount++;
          continue;
        }
        
        console.log(`🔄 Ajustando pregunta ${questionId}...`);
        console.log(`  📝 Correct answers actuales: [${currentCorrectAnswers.join(', ')}]`);
        
        // Ajustar correct_answers restando 1 a cada número
        const adjustedCorrectAnswers = currentCorrectAnswers.map((answer: number) => answer - 1);
        
        console.log(`  📝 Correct answers ajustadas: [${adjustedCorrectAnswers.join(', ')}]`);
        
        // Actualizar en la base de datos
        await firestore.collection('questions').doc(questionId).update({
          correct_answers: adjustedCorrectAnswers,
          updatedAt: new Date()
        });
        
        updatedCount++;
        console.log(`  ✅ Ajustada exitosamente\n`);
        
      } catch (error) {
        console.error(`❌ Error ajustando pregunta ${doc.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📈 Resumen del ajuste:');
    console.log(`✅ Preguntas ajustadas: ${updatedCount}`);
    console.log(`⏭️  Preguntas saltadas: ${skippedCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📊 Total procesadas: ${questionsSnapshot.size}`);
    
    if (updatedCount === 0) {
      console.log('\n💡 No se encontraron preguntas que necesiten ajuste.');
      console.log('💡 Esto puede significar que:');
      console.log('   - Todas las correct_answers ya están en formato 0-based');
      console.log('   - Las correct_answers contienen valores 0');
      console.log('   - Las correct_answers contienen valores negativos');
    } else if (errorCount === 0) {
      console.log('\n🎉 ¡Ajuste completado exitosamente!');
    } else {
      console.log('\n⚠️  Ajuste completado con errores.');
    }
    
  } catch (error) {
    console.error('❌ Error durante el ajuste:', error);
  }
}

// Ejecutar ajuste
fixCorrectAnswersForTopic().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
}); 