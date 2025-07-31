import firestore from '../src/config/database';

async function fixCorrectAnswers() {
  try {
    console.log('🔄 Iniciando ajuste de correct_answers...\n');
    
    // Obtener todas las preguntas
    const questionsSnapshot = await firestore.collection('questions').get();
    
    if (questionsSnapshot.empty) {
      console.log('📝 No se encontraron preguntas para ajustar');
      return;
    }
    
    console.log(`📊 Total de preguntas encontradas: ${questionsSnapshot.size}\n`);
    
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
        
        // Verificar si las opciones ya están en el nuevo formato (IDs numéricos)
        const enOptions = questionData.locales?.en?.options || [];
        const esOptions = questionData.locales?.es?.options || [];
        
        if (enOptions.length === 0 || esOptions.length === 0) {
          console.log(`⏭️  Pregunta ${questionId} no tiene opciones válidas, saltando...`);
          skippedCount++;
          continue;
        }
        
        // Verificar si las opciones ya están en el nuevo formato (IDs numéricos)
        const firstEnOption = enOptions[0];
        const firstEsOption = esOptions[0];
        
        if (!firstEnOption || !firstEsOption || 
            typeof firstEnOption.id !== 'number' || 
            typeof firstEsOption.id !== 'number') {
          console.log(`⏭️  Pregunta ${questionId} aún no tiene opciones con IDs numéricos, saltando...`);
          skippedCount++;
          continue;
        }
        
        // Verificar si las correct_answers necesitan ajuste
        const currentCorrectAnswers = questionData.correct_answers;
        
        // Mostrar información de debug para las primeras 5 preguntas
        if (debugCount < 5) {
          console.log(`🔍 Debug pregunta ${questionId}:`);
          console.log(`  - Correct answers: [${currentCorrectAnswers.join(', ')}]`);
          console.log(`  - En options IDs: [${enOptions.map((opt: any) => opt.id).join(', ')}]`);
          console.log(`  - Es options IDs: [${esOptions.map((opt: any) => opt.id).join(', ')}]`);
          debugCount++;
        }
        
        // Verificar si las correct_answers ya están ajustadas (si todos los valores son > 1)
        const allGreaterThanOne = currentCorrectAnswers.every((answer: number) => answer > 1);
        
        if (allGreaterThanOne) {
          console.log(`⏭️  Pregunta ${questionId} ya tiene correct_answers ajustadas (todos los valores > 1), saltando...`);
          skippedCount++;
          continue;
        }
        
        console.log(`🔄 Ajustando pregunta ${questionId}...`);
        console.log(`  📝 Correct answers actuales: [${currentCorrectAnswers.join(', ')}]`);
        
        // Ajustar correct_answers sumando 1 a cada número
        const adjustedCorrectAnswers = currentCorrectAnswers.map((answer: number) => answer + 1);
        
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
      console.log('   - Todas las correct_answers ya están ajustadas (valores > 1)');
      console.log('   - Las preguntas aún no tienen opciones con IDs numéricos');
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
fixCorrectAnswers().catch(err => {
  console.error('❌ Error fatal:', err);
  process.exit(1);
}); 