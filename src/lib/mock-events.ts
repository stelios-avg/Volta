import { addDays, atCyprus, compareCalendar, cyprusDate, formatLocalInput, cyprusLocalToISO } from './dates';
import { timeframeWindow } from './filters';
import type { EventRecord } from './types';

function onDate(dayOffsetFrom: { y: number; m: number; d: number }, hour: number, durationHours: number) {
  const startDate = cyprusLocalToISO(formatLocalInput(dayOffsetFrom, hour));
  if (!startDate) throw new Error('Invalid mock date');
  const endDate = new Date(new Date(startDate).getTime() + durationHours * 60 * 60 * 1000).toISOString();
  return { startDate, endDate };
}

function featuredUntil(now: Date): string {
  return new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000).toISOString();
}

function isWeekend(date: { y: number; m: number; d: number }): boolean {
  const day = new Date(Date.UTC(date.y, date.m - 1, date.d)).getUTCDay();
  return day === 0 || day === 6;
}

export function getMockEvents(now = new Date()): EventRecord[] {
  const today = cyprusDate(now);
  const weekend = timeframeWindow('weekend', now);
  const week = timeframeWindow('week', now);
  const month = timeframeWindow('month', now);
  let midweek = addDays(today, 1);
  while (compareCalendar(midweek, week.end) <= 0 && isWeekend(midweek)) midweek = addDays(midweek, 1);
  if (compareCalendar(midweek, week.end) > 0 || isWeekend(midweek)) midweek = today;

  const afterWeek = addDays(week.end, 1);
  const laterThisMonth = compareCalendar(afterWeek, month.end) <= 0 ? afterWeek : month.end;
  const nextMonth = addDays(month.end, 4);
  const boostUntil = featuredUntil(now);

  const events: EventRecord[] = [
    {
      id: 'mock-street-food',
      title: 'Street food στη Γερμασόγεια',
      slug: 'street-food-germasogeia',
      description:
        'Μικρά τραπέζια, ζωντανή μουσική χαμηλά και πάγκοι με σούβλες, χαλλούμι και γλυκά του κουταλιού κατά μήκος της παραλίας.\n\nΙδανικό για μια βόλτα μετά τη δουλειά. Η είσοδος είναι ελεύθερη και οι μερίδες πληρώνονται χωριστά.',
      ...onDate(today, 19, 4),
      district: 'Limassol',
      locationName: 'Παραλιακό μέτωπο Γερμασόγειας',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Germasogeia+Limassol+Cyprus',
      category: 'Food & Wine',
      priceText: 'Είσοδος ελεύθερη',
      imageUrl: '/media/food.jpg',
      imageAlt: 'Ζεστά φώτα και πάγκοι φαγητού σε παραλιακό δρόμο',
      isFeatured: true,
      featuredUntil: boostUntil,
      status: 'published',
    },
    {
      id: 'mock-jazz',
      title: 'Jazz στην Πύλη Αμμοχώστου',
      slug: 'jazz-pyli-ammochostou',
      description:
        'Κουαρτέτο από τη Λευκωσία παίζει standards και δύο κυπριακά τραγούδια σε νέα ενορχήστρωση, μέσα στα τείχη.\n\nΟι θέσεις είναι περιορισμένες. Τα ποτά σερβίρονται από το μπαρ της αυλής.',
      ...onDate(today, 20, 3),
      district: 'Nicosia',
      locationName: 'Πύλη Αμμοχώστου',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Famagusta+Gate+Nicosia',
      category: 'Live Music & Nightlife',
      priceText: '€15',
      ticketUrl: 'https://example.com/tickets/jazz-pyli',
      imageUrl: '/media/jazz.jpg',
      imageAlt: 'Σκηνή με ζεστό φωτισμό για βραδιά jazz',
      isFeatured: true,
      featuredUntil: boostUntil,
      status: 'published',
    },
    {
      id: 'mock-puppets',
      title: 'Εργαστήρι κουκλοθέατρου',
      slug: 'ergastiri-kouklotheatrou',
      description:
        'Παιδιά 4–10 ετών φτιάχνουν τη δική τους κούκλα και ανεβαίνουν σε μια μικρή παράσταση στο τέλος.\n\nΟι γονείς κάθονται στην αίθουσα. Τα υλικά περιλαμβάνονται στην τιμή.',
      ...onDate(today, 11, 2),
      district: 'Larnaca',
      locationName: 'Δημοτικό Θέατρο Λάρνακας',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Larnaca+Municipal+Theatre',
      category: 'Kids & Family',
      priceText: '€8',
      ticketUrl: 'https://example.com/tickets/kouklotheatro',
      imageUrl: '/media/kids.jpg',
      imageAlt: 'Χρωματιστά υφάσματα και κούκλες σε φωτεινή αίθουσα',
      isFeatured: false,
      status: 'published',
    },
    {
      id: 'mock-wine',
      title: 'Κρασογιορτή Λεμεσού',
      slug: 'krasogorti-lemesou',
      description:
        'Οινοποιεία της επαρχίας σερβίρουν δοκιμές στο Δημοτικό Κήπο, με τυριά, λουκάνικα και ένα μικρό πρόγραμμα παραδοσιακών χορών το απόγευμα.\n\nΤο εισιτήριο περιλαμβάνει ποτήρι δοκιμής. Παιδιά έως 12 ετών μπαίνουν δωρεάν με συνοδό.',
      ...onDate(weekend.start, 12, 9),
      district: 'Limassol',
      locationName: 'Δημοτικός Κήπος Λεμεσού',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Limassol+Municipal+Garden',
      category: 'Food & Wine',
      priceText: '€10',
      ticketUrl: 'https://example.com/tickets/krasogorti',
      imageUrl: '/media/wine.jpg',
      imageAlt: 'Ποτήρια κρασιού σε υπαίθριο κήπο',
      isFeatured: true,
      featuredUntil: boostUntil,
      status: 'published',
    },
    {
      id: 'mock-omodos',
      title: 'Πανηγύρι στην Όμοδο',
      slug: 'panigyri-omodou',
      description:
        'Λειτουργία, λούνα παρκ στην πλατεία και πάγκοι με παλούζες, σουτζούκο και κρασί του χωριού.\n\nΗ πλατεία κλείνει για τα αυτοκίνητα από νωρίς το απόγευμα. Παρκάρισμα στον περιφερειακό.',
      ...onDate(weekend.end, 18, 5),
      district: 'Troodos & Mountains',
      locationName: 'Πλατεία Ομόδους',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Omodos+Square+Cyprus',
      category: 'Village Festivals',
      priceText: 'Δωρεάν',
      imageUrl: '/media/village.jpg',
      imageAlt: 'Πέτρινο χωριό με πλατεία στο σούρουπο',
      isFeatured: false,
      status: 'published',
    },
    {
      id: 'mock-akamas',
      title: 'Πεζοπορία στο Ακάμα',
      slug: 'pezoporia-akama',
      description:
        'Εύκολη διαδρομή τριών ωρών από τα Λουτρά της Αφροδίτης ως τη Γαλάζια Λίμνη, με οδηγό από τοπικό σύλλογο.\n\nΦέρε νερό και κλειστά παπούτσια. Η συμμετοχή είναι δωρεάν, με προαιρετική εισφορά για το μονοπάτι.',
      ...onDate(weekend.start, 8, 4),
      district: 'Paphos',
      locationName: 'Λουτρά της Αφροδίτης',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Baths+of+Aphrodite+Cyprus',
      category: 'Outdoors & Nature',
      priceText: 'Δωρεάν',
      imageUrl: '/media/trail.jpg',
      imageAlt: 'Μονοπάτι ανάμεσα σε πεύκα και θάλασσα',
      isFeatured: false,
      status: 'published',
    },
    {
      id: 'mock-castle',
      title: 'Φως στο Κάστρο της Πάφου',
      slug: 'fos-sto-kastro-pafou',
      description:
        'Ο μεσαιωνικός λιμενοβραχίονας φωτίζεται για μία βραδιά, με σύντομες ιστορίες για το λιμάνι και ζωντανή μουσική στην προβλήτα.\n\nΗ είσοδος στο κάστρο είναι ελεύθερη για την εκδήλωση. Φτάσε νωρίς για θέση στον περίπατο.',
      ...onDate(midweek, 19, 3),
      district: 'Paphos',
      locationName: 'Κάστρο Πάφου',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Paphos+Castle',
      category: 'Culture & Theatre',
      priceText: 'Δωρεάν',
      imageUrl: '/media/castle.jpg',
      imageAlt: 'Πέτρινο κάστρο πάνω από τη θάλασσα στο ηλιοβασίλεμα',
      isFeatured: true,
      featuredUntil: boostUntil,
      status: 'published',
    },
    {
      id: 'mock-theatre',
      title: '«Ηλέκτρα» στο ΘΟΚ',
      slug: 'ilektra-thoc',
      description:
        'Νέα παραγωγή του Θεατρικού Οργανισμού Κύπρου, με υπέρτιτλους στα αγγλικά κάθε Τετάρτη.\n\nΟι πόρτες ανοίγουν 45 λεπτά νωρίτερα. Η παράσταση διαρκεί περίπου δύο ώρες με ένα διάλειμμα.',
      ...onDate(midweek, 20, 3),
      district: 'Nicosia',
      locationName: 'Θέατρο ΘΟΚ',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=THOC+Nicosia',
      category: 'Culture & Theatre',
      priceText: '€12',
      ticketUrl: 'https://example.com/tickets/ilektra',
      imageUrl: '/media/theatre.jpg',
      imageAlt: 'Κόκκινες θέσεις θεάτρου και φωτισμένη σκηνή',
      isFeatured: false,
      status: 'published',
    },
    {
      id: 'mock-protaras',
      title: 'Beach party στον Πρωταρά',
      slug: 'beach-party-protaras',
      description:
        'DJ set στην άμμο με τοπικά σχήματα να ανοίγουν τη βραδιά, και food trucks πίσω από τον πεζόδρομο.\n\nΤο εισιτήριο ισχύει για την αποβάθρα. Ισχύει έλεγχος ηλικίας 18+ μετά τις 22:00.',
      ...onDate(weekend.end, 17, 6),
      district: 'Famagusta',
      locationName: 'Παραλία Πρωταρά',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Protaras+beach+Cyprus',
      category: 'Live Music & Nightlife',
      priceText: '€20',
      ticketUrl: 'https://example.com/tickets/protaras',
      imageUrl: '/media/beach.jpg',
      imageAlt: 'Παραλία στο σούρουπο με φώτα κατά μήκος της ακτής',
      isFeatured: false,
      status: 'published',
    },
    {
      id: 'mock-market',
      title: 'Νυχτερινή αγορά εντός των τειχών',
      slug: 'nychterini-agora-lefkosia',
      description:
        'Σχεδιαστές, βινύλια, μεζέδες και κρασί από μικρούς παραγωγούς στα στενά γύρω από τη Φανερωμένη.\n\nΗ αγορά μένει ανοιχτή ως αργά. Πολλά στενά είναι πεζοδρομημένα.',
      ...onDate(weekend.start, 19, 5),
      district: 'Nicosia',
      locationName: 'Περιοχή Φανερωμένης',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Faneromeni+Nicosia',
      category: 'Food & Wine',
      priceText: 'Δωρεάν',
      imageUrl: '/media/market.jpg',
      imageAlt: 'Στενό με πάγκους και ζεστά φώτα τη νύχτα',
      isFeatured: false,
      status: 'published',
    },
    {
      id: 'mock-koilani',
      title: 'Οινογνωσία στην Κουμανδαρία',
      slug: 'oinognosia-koilani',
      description:
        'Περπάτημα στους αμπελώνες του Κοιλανίου και δοκιμή τεσσάρων κρασιών, μαζί με αρτοποιήματα του χωριού.\n\nΗ ξενάγηση γίνεται στα ελληνικά και στα αγγλικά. Χρειάζεται κράτηση.',
      ...onDate(laterThisMonth, 11, 3),
      district: 'Limassol',
      locationName: 'Κοιλάνι',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Koilani+Cyprus',
      category: 'Food & Wine',
      priceText: '€25',
      ticketUrl: 'https://example.com/tickets/koilani',
      imageUrl: '/media/cellar.jpg',
      imageAlt: 'Αμπελώνας σε πλαγιά με πέτρινο οινοποιείο',
      isFeatured: false,
      status: 'published',
    },
    {
      id: 'mock-kampos',
      title: 'Εργαστήρι φύσης στον Κάμπο',
      slug: 'ergastiri-fysis-kampos',
      description:
        'Οικογένειες μαθαίνουν να αναγνωρίζουν ίχνη, φύλλα και πουλιά του δάσους Πάφου, με σύντομη στάση για πικνίκ.\n\nΚατάλληλο για παιδιά από 6 ετών. Σε βροχή, το εργαστήρι μεταφέρεται στο καφενείο του χωριού.',
      ...onDate(laterThisMonth, 10, 3),
      district: 'Troodos & Mountains',
      locationName: 'Κάμπος Τσακίστρας',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kampos+Tsakistra+Cyprus',
      category: 'Kids & Family',
      priceText: 'Δωρεάν',
      imageUrl: '/media/nature.jpg',
      imageAlt: 'Παιδιά σε δασικό μονοπάτι με ψηλά πεύκα',
      isFeatured: false,
      status: 'published',
    },
    {
      id: 'mock-odeon',
      title: 'Συναυλία στο Αρχαίο Ωδείο',
      slug: 'synavlia-odio-pafou',
      description:
        'Η Συμφωνική Ορχήστρα Νέων παίζει δίπλα στο λιμάνι, με πρόγραμμα από Χατζιδάκι μέχρι σύγχρονους Κύπριους συνθέτες.\n\nΠάρε ένα ελαφρύ μπουφάν. Οι θέσεις είναι χωρίς αρίθμηση στις κερκίδες.',
      ...onDate(laterThisMonth, 20, 2),
      district: 'Paphos',
      locationName: 'Αρχαίο Ωδείο Πάφου',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Paphos+Odeon',
      category: 'Live Music & Nightlife',
      priceText: '€18',
      ticketUrl: 'https://example.com/tickets/odeon',
      imageUrl: '/media/odeon.jpg',
      imageAlt: 'Αρχαίο πέτρινο ωδείο το βράδυ',
      isFeatured: false,
      status: 'published',
    },
    {
      id: 'mock-craft',
      title: 'Παζάρι χειροτεχνίας στη Σκάλα',
      slug: 'pazari-cheirotechnias-larnaka',
      description:
        'Κεραμικά, υφαντά και prints από εργαστήρια της Λάρνακας, σε μια ήσυχη αυλή πίσω από τον Άγιο Λάζαρο.\n\nΜικρό καφέ στην είσοδο. Τα περισσότερα κομμάτια φεύγουν τυλιγμένα για δώρο.',
      ...onDate(laterThisMonth, 16, 4),
      district: 'Larnaca',
      locationName: 'Αυλή Αγίου Λαζάρου',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=St+Lazarus+Church+Larnaca',
      category: 'Culture & Theatre',
      priceText: 'Είσοδος ελεύθερη',
      imageUrl: '/media/craft.jpg',
      imageAlt: 'Χειροποίητα κεραμικά σε ξύλινο πάγκο',
      isFeatured: false,
      status: 'published',
    },
    {
      id: 'mock-kakopetria',
      title: 'Χειμερινό πανηγύρι Κακοπετριάς',
      slug: 'panigyri-kakopetrias',
      description:
        'Κρασί του χωριού, λουκουμάδες και ζωντανή ορχήστρα στην πλατεία, μόλις κρυώσει για τα καλά ο καιρός.\n\nΗ πλατεία γεμίζει νωρίς. Παρκάρισμα στην είσοδο του χωριού και μετά λίγα λεπτά με τα πόδια.',
      ...onDate(nextMonth, 17, 5),
      district: 'Troodos & Mountains',
      locationName: 'Πλατεία Κακοπετριάς',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Kakopetria+Square+Cyprus',
      category: 'Village Festivals',
      priceText: 'Δωρεάν',
      imageUrl: '/media/village.jpg',
      imageAlt: 'Ορεινό χωριό με πέτρινα σπίτια',
      isFeatured: false,
      status: 'published',
    },
    {
      id: 'mock-past',
      title: 'Χθεσινή πρόβα ανοιχτή στο κοινό',
      slug: 'xthesini-prova',
      description:
        'Ανοιχτή πρόβα για μια μικρή παρέα θεατών, με συζήτηση με τους συντελεστές στο τέλος.\n\nΗ πρόβα έχει ολοκληρωθεί και δεν εμφανίζεται πια στον κατάλογο των επερχόμενων.',
      ...atCyprus(-1, 19, 0, 2, now),
      district: 'Nicosia',
      locationName: 'Στέγη Γραμμάτων και Τεχνών',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Nicosia+Cyprus',
      category: 'Culture & Theatre',
      priceText: 'Δωρεάν',
      imageUrl: '/media/theatre.jpg',
      imageAlt: 'Άδεια σκηνή μετά την παράσταση',
      isFeatured: false,
      status: 'published',
    },
  ];

  return events.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
}
