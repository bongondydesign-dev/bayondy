const fs = require('fs');
const path = require('path');

const additions = {
  kr: {
    auth: {
      acceptationTexte: 'Lè w kreye kont ou, ou aksepte',
      lienConditions: 'kondisyon itilizasyon yo',
      et: 'ak',
      lienConfidentialite: 'politik konfidansyalite a'
    },
    legal: {
      banniereProvisoire: 'Tèks sa a pwovizwa. L ap relete anvan lansman.',
      banniereDetail: 'Pwen ki make yo dwe valide pa yon moun ki kalifye anvan ouvèti ofisyèl la.',
      aDecider: 'Pou deside',
      aConfirmer: 'Pou konfime'
    },
    aide: {
      titre: 'Ou bezwen plis èd ?',
      sousTitre: 'Si w gen yon kesyon ki pa nan lis la, nou la pou reponn ou.',
      contactBientot: 'Kontak la ap vini talè'
    },
    faqPage: {
      titre: 'Kesyon yo poze souvan (FAQ)',
      sousTitre: 'Tout repons sou fason BAYONDY fonksyone, fòmasyon yo ak peman yo.'
    },
    confidentialite: {
      badge: 'Lwa ak sekirite',
      titre: 'Politik Konfidansyalite',
      sousTitre: 'Fason nou trete, pwoteje epi itilize done ou yo sou platfòm BAYONDY.',
      s1_titre: '1. Kiyès nou ye',
      s1_texte: 'Platfòm BAYONDY fèt pou pèmèt ou aprann konpetans modèn nan lang kreyòl. Entite legal responsab la ak adrès li se :',
      s2_titre: '2. Done nou kolekte',
      s2_compte: 'Done kont ou : Lè w kreye yon kont, nou itilize non w, adrès imèl ou, foto pwofil ou (si w konekte ak Google) ak dat ou kreye kont la.',
      s2_progression: 'Done fòmasyon ak pwogrè : Nou anrejistre fòmasyon ou achte yo, leson ou fini gade yo ak dènye leson ou te kite a pou w ka reprann fasil.',
      s2_paiement: 'Done peman : Nou konsève sèlman nimewo referans tranzaksyon an, montan an, lajan an (HTG oswa USD), mwayen peman chwazi a (MonCash, NatCash oswa Kat) ak dat la.',
      s3_titre: '3. Poukisa nou itilize done sa yo',
      s3_texte: 'Done sa yo sèvi sèlman pou : kreye ak jere kont ou, ba w aksè nan fòmasyon ou peye yo, swiv pwogrè w nan leson yo, epi valide tranzaksyon yo ak operatè peman an.',
      s4_titre: '4. Sèvis ak patnè ekstèn',
      s4_firebase: 'Firebase / Google Cloud : Pou otantifikasyon sekirize ak baz done a.',
      s4_tranzak: 'Tranzak : Pou trete peman yo (MonCash, NatCash, Kat).',
      s4_youtube: 'YouTube (youtube-nocookie.com) : Pou difize videyo leson yo. Videyo a pa chaje toutotan ou pa klike sou bouton gade a.',
      s4_vercel: 'Vercel : Pou ebèjman platfòm entènèt la.',
      s5_titre: '5. Sekirite peman ak kat labank',
      s5_texte: 'BAYONDY pa janm wè ni konsève kòd sekrè PIN MonCash/NatCash ou, ni nimewo kat labank ou. Tout tranzaksyon fèt dirèkteman sou paj sekirize Tranzak la oswa modil TranzakCard la. Règleman detaye sou konsèvasyon bò kote Tranzak :',
      s6_titre: '6. Konbyen tan nou kenbe done yo',
      s6_texte: 'Done kont ou ak fòmasyon ou yo konsève toutotan kont ou aktif. Règleman espesifik sou dire egzak konsèvasyon :',
      s7_titre: '7. Dwa ou genyen sou done ou',
      s7_texte: 'Ou gen dwa mande aksè, korije oswa mande efase done pèsonèl ou. Pwosedi ak adrès pou egzèse dwa sa yo :',
      s8_titre: '8. Kuki ak memwa navigatè a',
      s8_texte: 'Nou pa itilize okenn kuki piblisite ni okenn zouti pou swiv aktivite w sou lòt sit. Sèl sa ki rete nan navigatè w se sesyon koneksyon Firebase Auth la pou w pa oblije tape modpas ou chak fwa w ouvri paj la.',
      s9_titre: '9. Pwoteksyon minè yo',
      s9_texte: 'Platfòm nan fèt pou moun ki gen laj pou itilize sèvis entènèt ak peman. Règleman sou minè yo :',
      s10_titre: '10. Modifikasyon ak dènye mizajou',
      s10_texte: 'Nou ka mete politik sa a ajou lè sa nesesè. Dènye dat mizajou :'
    },
    conditions: {
      badge: 'Lwa ak sèvis',
      titre: 'Kondisyon Itilizasyon',
      sousTitre: 'Règ ak angajman pou itilize platfòm aprantisaj BAYONDY.',
      s1_titre: '1. Objè sèvis la',
      s1_texte: 'BAYONDY bay fòmasyon videyo an kreyòl ayisyen sou entènèt. Aksè nan kou yo louvri pou moun ki kreye yon kont epi ki konplete peman yo.',
      s2_titre: '2. Kont itilizatè',
      s2_texte: 'Chak kont se yon kont pèsonèl. Ou responsab pou bay enfòmasyon ki egzak epi pou w pa pataje kòd aksè w ak lòt moun.',
      s3_titre: '3. Acha, pri ak aksè',
      s3_texte: 'Pri yo afiche an Gourdes (HTG) oswa an Dola (USD). Aksè nan fòmasyon an debloke sèlman lè sèvè nou an fin konfime peman an ak operatè a. Dire aksè nan fòmasyon an :',
      s4_titre: '4. Règleman sou ranbousman',
      s4_texte: 'Kondisyon ak delè pou nenpòt demand ranbousman :',
      s5_titre: '5. Règ itilizasyon ak entèdiksyon',
      s5_texte: 'Li entèdi nèt pou w kopye, anrejistre, revann oswa pataje lyen videyo yo ak lòt moun. Fòmasyon yo fèt pou pwòp aprantisaj pa w.',
      s6_titre: '6. Pwopriyete entèlektyèl',
      s6_texte: 'Tout kontni, videyo, tèks, logo ak materyèl ki sou BAYONDY rete pwopriyete eksklizif BAYONDY oswa otè ki kreye yo.',
      s7_titre: '7. Sispansyon oswa retire aksè',
      s7_texte: 'Si yon itilizatè pa respekte règ sa yo (pa egzanp pataje videyo oswa tante pirate sistèm nan), administrasyon an gen dwa sispann oswa retire aksè li san avètisman.',
      s8_titre: '8. Disponibilite ak garanti',
      s8_texte: 'Sèvis la bay « jan l ye a ». Nou fè tout efò pou platfòm nan toujou mache, men nou pa ka garanti li pap janm gen pann rezo. Fòmasyon yo pa bay okenn garanti otomatik sou jwenn travay oswa siksè finansye.',
      s9_titre: '9. Lwa ki aplikab ak regleman litij',
      s9_texte: 'Lwa ak tribinal konpetan an ka de kontestasyon :',
      s10_titre: '10. Kontak ak dat mizajou',
      s10_texte: 'Pou nenpòt kesyon sou kondisyon sa yo, kontak ofisyèl ak dat dènye mizajou :'
    }
  },
  fr: {
    auth: {
      acceptationTexte: 'En créant votre compte, vous acceptez nos',
      lienConditions: 'conditions d\'utilisation',
      et: 'et notre',
      lienConfidentialite: 'politique de confidentialité'
    },
    legal: {
      banniereProvisoire: 'Ce texte est provisoire. Il sera relu et validé avant le lancement officiel.',
      banniereDetail: 'Les éléments marqués doivent être validés par une personne qualifiée avant ouverture.',
      aDecider: 'À DÉCIDER',
      aConfirmer: 'À CONFIRMER'
    },
    aide: {
      titre: 'Besoin d\'aide ?',
      sousTitre: 'Si vous avez une question qui n\'est pas dans cette liste, nous sommes là pour vous aider.',
      contactBientot: 'Le moyen de contact arrive bientôt'
    },
    faqPage: {
      titre: 'Foire aux questions (FAQ)',
      sousTitre: 'Toutes les réponses sur le fonctionnement de BAYONDY, les formations et les paiements.'
    },
    confidentialite: {
      badge: 'Légal et sécurité',
      titre: 'Politique de Confidentialité',
      sousTitre: 'Comment nous traitons, protégeons et utilisons vos données sur BAYONDY.',
      s1_titre: '1. Qui sommes-nous',
      s1_texte: 'La plateforme BAYONDY propose des formations vidéo en créole haïtien. L\'entité légale responsable et son adresse sont :',
      s2_titre: '2. Données que nous collectons',
      s2_compte: 'Données de compte : Lors de votre inscription, nous utilisons votre nom, votre e-mail, votre photo de profil (si connexion Google) et les dates de connexion.',
      s2_progression: 'Données d\'apprentissage : Nous enregistrons vos inscriptions actives, les leçons complétées et la dernière leçon consultée.',
      s2_paiement: 'Données de paiement : Nous conservons uniquement la référence de transaction, le montant, la devise, la méthode choisie et la date.',
      s3_titre: '3. Pourquoi nous les utilisons',
      s3_texte: 'Ces données sont strictement utilisées pour : créer et gérer votre compte, vous donner accès aux cours achetés, suivre votre progression pédagogique et vérifier vos paiements.',
      s4_titre: '4. Services tiers sous-traitants',
      s4_firebase: 'Firebase / Google Cloud : Pour l\'authentification sécurisée et le stockage de la base de données.',
      s4_tranzak: 'Tranzak : Pour le traitement des paiements (MonCash, NatCash, Carte).',
      s4_youtube: 'YouTube (youtube-nocookie.com) : Pour la diffusion des vidéos de cours. L\'iframe ne se charge qu\'après votre clic explicite.',
      s4_vercel: 'Vercel : Pour l\'hébergement de l\'application web.',
      s5_titre: '5. Sécurité des paiements',
      s5_texte: 'BAYONDY ne reçoit ni ne stocke jamais vos codes secrets PIN MonCash/NatCash ni vos numéros complets de carte bancaire. Les paiements sont traités directement par Tranzak. Conditions de conservation chez Tranzak :',
      s6_titre: '6. Durée de conservation',
      s6_texte: 'Les données de votre compte et de vos cours sont conservées tant que votre compte reste actif. Durée légale exacte :',
      s7_titre: '7. Vos droits',
      s7_texte: 'Vous avez le droit de consulter, rectifier ou demander la suppression de vos données personnelles. Procédure pour exercer vos droits :',
      s8_titre: '8. Cookies et stockage local',
      s8_texte: 'Nous n\'utilisons aucun cookie publicitaire ni traceur commercial. Seule la session de connexion Firebase Auth est conservée localement dans votre navigateur.',
      s9_titre: '9. Protection des mineurs',
      s9_texte: 'La plateforme est destinée aux personnes en âge de contracter et d\'utiliser des services en ligne. Politique concernant les mineurs :',
      s10_titre: '10. Mises à jour de la politique',
      s10_texte: 'Cette politique peut être mise à jour occasionnellement. Date de dernière mise à jour :'
    },
    conditions: {
      badge: 'Légal et service',
      titre: 'Conditions Générales d\'Utilisation',
      sousTitre: 'Règles et engagements régissant l\'utilisation de la plateforme BAYONDY.',
      s1_titre: '1. Objet du service',
      s1_texte: 'BAYONDY propose des formations vidéo en ligne en créole haïtien. L\'accès est réservé aux utilisateurs inscrits ayant validé leur paiement.',
      s2_titre: '2. Compte utilisateur',
      s2_texte: 'Chaque compte est strictement personnel. Vous vous engagez à fournir des informations exactes et à préserver la confidentialité de vos identifiants.',
      s3_titre: '3. Achat, tarifs et accès',
      s3_texte: 'Les prix sont affichés en gourdes (HTG) ou dollars (USD). L\'accès est activé dès confirmation du paiement par le serveur. Durée d\'accès aux cours :',
      s4_titre: '4. Politique de remboursement',
      s4_texte: 'Conditions et modalités de remboursement éventuel :',
      s5_titre: '5. Utilisation acceptable et interdictions',
      s5_texte: 'Il est strictement interdit de copier, télécharger, revendre ou partager les liens vidéo avec des tiers. Le contenu est destiné à votre usage privé.',
      s6_titre: '6. Propriété intellectuelle',
      s6_texte: 'Tous les contenus, vidéos, textes, logos et supports pédagogiques demeurent la propriété exclusive de BAYONDY ou de leurs auteurs respectifs.',
      s7_titre: '7. Suspension ou retrait d\'accès',
      s7_texte: 'En cas de non-respect de ces règles (notamment partage abusif ou tentative de piratage), l\'accès à la plateforme pourra être suspendu ou révoqué sans préavis.',
      s8_titre: '8. Disponibilité et absence de garantie',
      s8_texte: 'Le service est fourni « tel quel ». Nous mettons tout en œuvre pour assurer la disponibilité du service sans garantir l\'absence totale d\'interruption. Les formations ne constituent pas une promesse de résultat professionnel.',
      s9_titre: '9. Droit applicable et litiges',
      s9_texte: 'Législation applicable et juridiction compétente en cas de litige :',
      s10_titre: '10. Contact et date de mise à jour',
      s10_texte: 'Pour toute question relative aux présentes conditions, contact officiel et date de dernière révision :'
    }
  },
  en: {
    auth: {
      acceptationTexte: 'By creating an account, you accept our',
      lienConditions: 'terms of service',
      et: 'and our',
      lienConfidentialite: 'privacy policy'
    },
    legal: {
      banniereProvisoire: 'This text is a draft. It will be reviewed and finalized before launch.',
      banniereDetail: 'Marked items must be validated by a qualified professional before official launch.',
      aDecider: 'TO BE DECIDED',
      aConfirmer: 'TO BE CONFIRMED'
    },
    aide: {
      titre: 'Need help?',
      sousTitre: 'If you have a question not listed here, we are here to help.',
      contactBientot: 'Contact method coming soon'
    },
    faqPage: {
      titre: 'Frequently Asked Questions (FAQ)',
      sousTitre: 'All answers about how BAYONDY works, our courses, and payments.'
    },
    confidentialite: {
      badge: 'Legal & security',
      titre: 'Privacy Policy',
      sousTitre: 'How we process, protect, and use your data on the BAYONDY platform.',
      s1_titre: '1. Who we are',
      s1_texte: 'The BAYONDY platform offers online video courses in Haitian Creole. The legal entity and address are:',
      s2_titre: '2. Data we collect',
      s2_compte: 'Account data: When registering, we use your name, email, profile picture (if Google login), and timestamps.',
      s2_progression: 'Learning data: We record your active course enrollments, completed lessons, and last viewed lesson.',
      s2_paiement: 'Payment data: We only retain the transaction reference, amount, currency, selected payment method, and timestamp.',
      s3_titre: '3. Why we use this data',
      s3_texte: 'This data is strictly used to: create and manage your account, grant access to purchased courses, track your learning progress, and verify payments.',
      s4_titre: '4. Third-party services',
      s4_firebase: 'Firebase / Google Cloud: For secure authentication and database storage.',
      s4_tranzak: 'Tranzak: For payment processing (MonCash, NatCash, Card).',
      s4_youtube: 'YouTube (youtube-nocookie.com): For video streaming. The player loads only after your explicit click.',
      s4_vercel: 'Vercel: For hosting the web application.',
      s5_titre: '5. Payment security',
      s5_texte: 'BAYONDY never sees or stores your secret PIN for MonCash/NatCash or full credit card numbers. Payments are processed directly by Tranzak. Retention details at Tranzak:',
      s6_titre: '6. Data retention period',
      s6_texte: 'Your account and course data are stored as long as your account remains active. Exact retention timeframe:',
      s7_titre: '7. Your rights',
      s7_texte: 'You have the right to access, rectify, or request deletion of your personal data. Procedure to exercise your rights:',
      s8_titre: '8. Cookies and local storage',
      s8_texte: 'We do not use any advertising cookies or trackers. Only your Firebase Auth sign-in session is stored locally in your browser.',
      s9_titre: '9. Children\'s privacy',
      s9_texte: 'The platform is intended for users of legal age to contract and use online services. Policy regarding minors:',
      s10_titre: '10. Policy updates',
      s10_texte: 'This policy may be updated periodically. Last updated date:'
    },
    conditions: {
      badge: 'Legal & terms',
      titre: 'Terms of Service',
      sousTitre: 'Rules and commitments governing the use of the BAYONDY platform.',
      s1_titre: '1. Purpose of the service',
      s1_texte: 'BAYONDY provides online video training in Haitian Creole. Access is reserved for registered users who have completed their payment.',
      s2_titre: '2. User account',
      s2_texte: 'Each account is strictly personal. You agree to provide accurate information and keep your credentials confidential.',
      s3_titre: '3. Purchase, pricing and access',
      s3_texte: 'Prices are displayed in gourdes (HTG) or dollars (USD). Access is granted once payment is confirmed by the server. Course access duration:',
      s4_titre: '4. Refund policy',
      s4_texte: 'Conditions and terms for refund requests:',
      s5_titre: '5. Acceptable use and restrictions',
      s5_texte: 'It is strictly forbidden to copy, download, resell, or share video links with third parties. Content is for your personal use only.',
      s6_titre: '6. Intellectual property',
      s6_texte: 'All content, videos, texts, logos, and materials remain the exclusive property of BAYONDY or their respective authors.',
      s7_titre: '7. Suspension or termination of access',
      s7_texte: 'In the event of a breach of these rules (such as link sharing or hacking attempts), access may be suspended or revoked without notice.',
      s8_titre: '8. Availability and disclaimer',
      s8_texte: 'The service is provided \'as is\'. We strive to maintain high availability but do not guarantee uninterrupted access. Courses do not guarantee employment or financial outcomes.',
      s9_titre: '9. Governing law and dispute resolution',
      s9_texte: 'Applicable legislation and jurisdiction in case of dispute:',
      s10_titre: '10. Contact and update date',
      s10_texte: 'For any questions regarding these terms, official contact and last revision date:'
    }
  }
};

['kr', 'fr', 'en'].forEach(lang => {
  const filePath = path.join(__dirname, '..', 'src', 'messages', `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  data.auth = { ...data.auth, ...additions[lang].auth };
  data.legal = additions[lang].legal;
  data.aide = additions[lang].aide;
  data.faqPage = additions[lang].faqPage;
  data.confidentialite = additions[lang].confidentialite;
  data.conditions = additions[lang].conditions;

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('Successfully updated', filePath);
});
