import firestore from '../src/config/database';
import { QuestionModel } from '../src/models/Question';

const questionModel = new QuestionModel();

// Función para verificar si las opciones necesitan migración
function needsMigration(options: any[]): boolean {
  // Si las opciones son strings, necesitan migración
  if (options.length > 0 && typeof options[0] === 'string') {
    return true;
  }
  
  // Si las opciones son objetos pero tienen IDs en formato "opt_XXX", necesitan migración
  if (options.length > 0 && typeof options[0] === 'object' && options[0].id) {
    return options.some(option => 
      typeof option.id === 'string' && option.id.startsWith('opt_')
    );
  }
  
  return false;
}

// Función para generar IDs únicos para las opciones
function generateOptionIds(options: string[]): any[] {
  return options.map((option, index) => ({
    id: index + 1, // Usar números enteros: 1, 2, 3, 4...
    text: option
  }));
}

// Función para convertir IDs de formato "opt_XXX" a números
function convertOptIdsToNumbers(options: any[]): any[] {
  return options.map((option, index) => ({
    id: index + 1, // Usar números enteros: 1, 2, 3, 4...
    text: option.text
  }));
}

// Función para convertir una pregunta del formato anterior al nuevo
function migrateQuestion(question: any): any {
  const migratedQuestion = { ...question };
  
  // Migrar opciones en inglés
  if (migratedQuestion.locales?.en?.options) {
    const enOptions = migratedQuestion.locales.en.options;
    
    if (needsMigration(enOptions)) {
      if (typeof enOptions[0] === 'string') {
        // Convertir de strings a objetos con IDs numéricos
        migratedQuestion.locales.en.options = generateOptionIds(enOptions);
      } else if (typeof enOptions[0] === 'object' && enOptions[0].id) {
        // Convertir IDs de formato "opt_XXX" a números
        migratedQuestion.locales.en.options = convertOptIdsToNumbers(enOptions);
      }
    }
  }
  
  // Migrar opciones en español
  if (migratedQuestion.locales?.es?.options) {
    const esOptions = migratedQuestion.locales.es.options;
    
    if (needsMigration(esOptions)) {
      if (typeof esOptions[0] === 'string') {
        // Convertir de strings a objetos con IDs numéricos
        migratedQuestion.locales.es.options = generateOptionIds(esOptions);
      } else if (typeof esOptions[0] === 'object' && esOptions[0].id) {
        // Convertir IDs de formato "opt_XXX" a números
        migratedQuestion.locales.es.options = convertOptIdsToNumbers(esOptions);
      }
    }
  }
  
  return migratedQuestion;
}

// Función para mostrar un ejemplo de migración
function showMigrationExample() {
  console.log('\n📝 Ejemplo de migración:');
  console.log('\nFormato anterior:');
  console.log(JSON.stringify({
    locales: {
      en: {
        question: "What is 2+2?",
        options: ["3", "4", "5", "6"],
        explanation: "2+2 equals 4"
      },
      es: {
        question: "¿Cuánto es 2+2?",
        options: ["3", "4", "5", "6"],
        explanation: "2+2 es igual a 4"
      }
    }
  }, null, 2));

  console.log('\nFormato nuevo:');
  console.log(JSON.stringify({
    locales: {
      en: {
        question: "What is 2+2?",
        options: [
          { id: 1, text: "3" },
          { id: 2, text: "4" },
          { id: 3, text: "5" },
          { id: 4, text: "6" }
        ],
        explanation: "2+2 equals 4"
      },
      es: {
        question: "¿Cuánto es 2+2?",
        options: [
          { id: 1, text: "3" },
          { id: 2, text: "4" },
          { id: 3, text: "5" },
          { id: 4, text: "6" }
        ],
        explanation: "2+2 es igual a 4"
      }
    }
  }, null, 2));
}

async function migrateQuestions() {
  try {
    console.log('🔄 Iniciando migración de opciones...\n');
    
    // Obtener todas las preguntas
    const questionsSnapshot = await firestore.collection('questions').get();
    
    if (questionsSnapshot.empty) {
      console.log('📝 No se encontraron preguntas para migrar');
      return;
    }
    
    console.log(`📊 Total de preguntas encontradas: ${questionsSnapshot.size}\n`);
    
    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    for (const doc of questionsSnapshot.docs) {
      try {
        const questionId = doc.id;
        const questionData = doc.data();
        
        // Verificar si necesita migración
        const enOptions = questionData.locales?.en?.options || [];
        const esOptions = questionData.locales?.es?.options || [];
        
        const needsEnMigration = needsMigration(enOptions);
        const needsEsMigration = needsMigration(esOptions);
        
        if (needsEnMigration || needsEsMigration) {
          console.log(`🔄 Migrando pregunta ${questionId}...`);
          
          if (needsEnMigration) {
            console.log(`  📝 EN: ${enOptions.length} opciones`);
            if (typeof enOptions[0] === 'string') {
              console.log(`     Convertiendo de strings a objetos con IDs numéricos`);
            } else {
              console.log(`     Convertiendo IDs de "opt_XXX" a números`);
            }
          }
          
          if (needsEsMigration) {
            console.log(`  📝 ES: ${esOptions.length} opciones`);
            if (typeof esOptions[0] === 'string') {
              console.log(`     Convertiendo de strings a objetos con IDs numéricos`);
            } else {
              console.log(`     Convertiendo IDs de "opt_XXX" a números`);
            }
          }
          
          // Convertir al nuevo formato
          const convertedQuestion = migrateQuestion({
            id: questionId,
            ...questionData
          });
          
          // Actualizar en la base de datos
          await firestore.collection('questions').doc(questionId).update({
            locales: convertedQuestion.locales,
            updatedAt: new Date()
          });
          
          migratedCount++;
          console.log(`  ✅ Migrada exitosamente\n`);
        } else {
          skippedCount++;
        }
      } catch (error) {
        console.error(`❌ Error migrando pregunta ${doc.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n📈 Resumen de la migración:');
    console.log(`✅ Preguntas migradas: ${migratedCount}`);
    console.log(`⏭️  Preguntas saltadas: ${skippedCount}`);
    console.log(`❌ Errores: ${errorCount}`);
    console.log(`📊 Total procesadas: ${questionsSnapshot.size}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 ¡Migración completada exitosamente!');
    } else {
      console.log('\n⚠️  Migración completada con errores.');
    }
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
  }
}

// Verificar si se ejecuta en modo ejemplo
if (process.argv.includes('--example')) {
  showMigrationExample();
} else {
  // Ejecutar migración
  migrateQuestions().catch(err => {
    console.error('❌ Error fatal:', err);
    process.exit(1);
  });
} 