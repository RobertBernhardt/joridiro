import contestTypes from "./contstTypes"

const demo = new Map()

demo.set('QUARTERMEAL_LARGE_DEADLINE', {
    grandPrize: {
        amount: contestTypes.get("LARGE").grand_prize,
        winner: null,
        participants_reached: []
    },
    lotteryPrize: {
        amount: contestTypes.get("LARGE").lottery_prize,
        winner: null
    },
    about_contest: {
        short_description:
            'Quartermeal is a new food delivery service which specializes in serving the meals faster than any competitor. We guarantee to deliver within 15 min after ordering. To achieve this we encourage our partner restaurants to only offer food which they can finalize pretty fast, as well as our innovative food boxes and driver network. Quartermeal is only available in specific urban environments. When the delivery takes longer than 15 min, the customer gets the meal for free',
        target_audience:
            'Restaurants, snacks and pubs in London within our area of business who are able to serve food extremely fast so that a driver can pick up and deliver it. You can also just put those meals of your menu on Quartermeal, which you can prepare rapidly',
        purpose:
            'We want to get our platform going, starting in London. For this we need restaurants to serve the food our drivers can deliver and our customers love to eat within 15 min',
        how_to_win: 'This is a large contest so you win if you have the most points within 45 days. There are three ways to score: 1) you have another 150 £ of revenue with your restaurant on Quartermeal, which gives you one point each 2) you get 1 point once for every order 3) you get 3 points for every 5 star review you get. To increase the likelihood of you getting orders you have to put as many good offers on our platform as possible. Great pictures and descriptions are important. You can also share your offer on social media with your followers',
        boost: 'Our delivery drivers are ready to pick up your food immediately. Also we are gonna make a huge parallel marketing campaign in social media and on wallpapers targeting people in London ordering their deliveries on Quartermeal',
        tags: ['Restaurant', 'Food Delivery', 'Rapid', 'London', 'Fast food']
    },
    requirements: {
        categories: [],
        countries: ["London"],
        roles: ["You are the owner of a restaurant"],
        additional: [{
            name:"Actually yes",
            description: "The more restaurants we have on our platform the better the system works so if you have this 'unfair advantage' feel free to use it"
        }]
    },
    about_company: {
        name: 'Quartermeal Corp',
        link: 'www.quartermeal.com',
        logo: 'https://storage.cloud.google.com/joridiro_contest/ABC/logo.png',
        description: 'We are a food delivery platform which guarantees delivery within 15 min after ordering'
    },
    _id: 'Quartermeal Large Deadline',
    organizer: '63cce24692726a92b7690c5a',
    organizer_platform: 'https://joridiro.com/contests/create',
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().getTime() + contestTypes.get("LARGE").days * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
        {
            date : new Date(new Date().getTime() + contestTypes.get("LARGE").milestones[0].days * 24 * 60 * 60 * 1000).toISOString(),
            prize : contestTypes.get("LARGE").milestones[0].prize,
            same_type : true
        },
        {
            date : new Date(new Date().getTime() + contestTypes.get("LARGE").milestones[1].days * 24 * 60 * 60 * 1000).toISOString(),
            prize : contestTypes.get("LARGE").milestones[0].prize,
            same_type : true
        },
        {
            date : new Date(new Date().getTime() + contestTypes.get("LARGE").milestones[2].days * 24 * 60 * 60 * 1000).toISOString(),
            prize : contestTypes.get("LARGE").milestones[0].prize,
            same_type : true
        },
    ],
    open: true,
    title: 'Grow on Quartermeal with your restaurant in London',
    banner: 'https://storage.cloud.google.com/joridiro_contest/ABC/banner.png',
    type: "DEADLINE",
    size: "LARGE",
    score: [
        {
            name: '1',
            number: 150,
            points: 1,
            measuring_unit: '€ revenue',
            description: 'Get 1 point for every 150 £ revenue',
        },
        {
            name: '1',
            number: 1,
            points: 1,
            measuring_unit: 'every order',
            description: 'Get 1 point for every order',
        },
        {
            name: '1',
            number: 1,
            points: 3,
            measuring_unit: '5 star review',
            description: 'Get 3 points for every 5 star review',
        }
    ],
    questions: [],
    rules: ['The delivery has to be finished within 15 min of ordering', 'You can only get one point per customer'],
    payment_status: 'PAID',
    announcements: [
        {
            announcement: "We started our big social media campaign, so you should get a boost of orders soon",
            date: new Date().toISOString()
        },
        {
            announcement: "We now have poster ads in the Piccadilly Circus station!",
            date: new Date().toISOString()
        }
    ],
    faq: [
        {
            question: "How is it even possible to deliver within 15 min after ordering?",
            answer: "Of course this is not possible with every meal. So you have to specialize on meals which you can prepare nearly finished and just have to add the last ingredient or final roasting. We don't say it's easy but we know that customers love it when they get their food that fast. So if you're able to prepare food super fast you can reach a whole new market. Also we have an innovative new system how we organize our drivers to minimize their and your waiting time",
            questioner: "63cc34e35188d719fc18d097"
        },
        {
            question: "What happens if the delivery takes longer than 15 min?",
            answer: "Both you and the driver don't get paid (we as well). So you can make settings in our app that restrict the driving distance to your location to whatever you think is realistic and also just take drivers who have a 5 star review average. But of course the more you restrict, the less revenue you can make",
            questioner: "63cc34e35188d719fc18d097"
        },
        {
            question: "I own several restaurants in the area. Can I combine their points for this contest?",
            answer: "Actually yes. The more restaurants we have on our platform the better the system works so if you have this 'unfair advantage' feel free to use it",
            questioner: "63cc34e35188d719fc18d097"
        }
    ],
    participants: [],
})

demo.set('QUARTERMEAL_MEDIUM_DEADLINE', {
    grandPrize: {
        amount: contestTypes.get("MEDIUM").grand_prize,
        winner: null,
        participants_reached: []
    },
    lotteryPrize: {
        amount: contestTypes.get("MEDIUM").lottery_prize,
        winner: null
    },
    about_contest: {
        short_description:
            'Quartermeal is a new food delivery service which specializes in serving the meals faster than any competitor. We guarantee to deliver within 15 min after ordering. To achieve this we encourage our partner restaurants to only offer food which they can finalize pretty fast, as well as our innovative food boxes and driver network. Quartermeal is only available in specific urban environments. When the delivery takes longer than 15 min, the customer gets the meal for free',
        target_audience:
            'Restaurants, snacks and pubs in London within our area of business who are able to serve food extremely fast so that a driver can pick up and deliver it. You can also just put those meals of your menu on Quartermeal, which you can prepare rapidly',
        purpose:
            'We want to get our platform going, starting in London. For this we need restaurants to serve the food our drivers can deliver and our customers love to eat within 15 min',
        how_to_win: 'This is a large contest so you win if you have the most points within 45 days. There are three ways to score: 1) you have another 150 £ of revenue with your restaurant on Quartermeal, which gives you one point each 2) you get 1 point once for every order 3) you get 3 points for every 5 star review you get. To increase the likelihood of you getting orders you have to put as many good offers on our platform as possible. Great pictures and descriptions are important. You can also share your offer on social media with your followers',
        boost: 'Our delivery drivers are ready to pick up your food immediately. Also we are gonna make a huge parallel marketing campaign in social media and on wallpapers targeting people in London ordering their deliveries on Quartermeal',
        tags: ['Restaurant', 'Food Delivery', 'Rapid', 'London', 'Fast food']
    },
    requirements: {
        categories: [],
        countries: ["London - Soho"],
        roles: ["You are the owner of a restaurant"],
        additional: [{
            name:"Fast Meals",
            description: "You set up fast meals on Quartermeal.com"
        }]
    },
    about_company: {
        name: 'Quartermeal Corp',
        link: 'www.quartermeal.com',
        logo: 'https://storage.cloud.google.com/joridiro_contest/ABC/logo.png',
        description: 'We are a food delivery platform which guarantees delivery within 15 min after ordering'
    },
    _id: 'Quartermeal Medium Deadline',
    organizer: '63cce24692726a92b7690c5a',
    organizer_platform: 'https://joridiro.com/contests/create',
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().getTime() + contestTypes.get("MEDIUM").days * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
        {
            date : new Date(new Date().getTime() + contestTypes.get("MEDIUM").milestones[0].days * 24 * 60 * 60 * 1000).toISOString(),
            prize : contestTypes.get("MEDIUM").milestones[0].prize,
            same_type : true
        }
    ],
    open: true,
    title: 'Grow on Quartermeal with your restaurant in London',
    banner: 'https://storage.cloud.google.com/joridiro_contest/ABC/banner.png',
    type: "DEADLINE",
    size: "MEDIUM",
    score: [
        {
            name: '1',
            number: 100,
            points: 1,
            measuring_unit: '€ revenue',
            description: 'Get 1 point for every 100 £ revenue',
        },
        {
            name: '1',
            number: 1,
            points: 1,
            measuring_unit: 'every meal ordered once',
            description: 'Get 1 point for every meal of you which is at least ordered once',
        },
        {
            name: '1',
            number: 1,
            points: 3,
            measuring_unit: 'review',
            description: 'Get 3 points for every review you get',
        }
    ],
    questions: [],
    rules: ['The delivery has to be finished within 15 min of ordering', 'You can only get one point per customer'],
    payment_status: 'PAID',
    announcements: [
        {
            announcement: "We started our big social media campaign, so you should get a boost of orders soon",
            date: new Date().toISOString()
        },
        {
            announcement: "We now have poster ads in the Piccadilly Circus station!",
            date: new Date().toISOString()
        },
        {
            announcement: "We hired another ten drivers!",
            date: new Date().toISOString()
        }
    ],
    faq: [
        {
            question: "How is it even possible to deliver within 15 min after ordering?",
            answer: "Of course this is not possible with every meal. So you have to specialize on meals which you can prepare nearly finished and just have to add the last ingredient or final roasting. We don't say it's easy but we know that customers love it when they get their food that fast. So if you're able to prepare food super fast you can reach a whole new market. Also we have an innovative new system how we organize our drivers to minimize their and your waiting time",
            questioner: "63cc34e35188d719fc18d097"
        },
        {
            question: "What happens if the delivery takes longer than 15 min?",
            answer: "Both you and the driver don't get paid (we as well). So you can make settings in our app that restrict the driving distance to your location to whatever you think is realistic and also just take drivers who have a 5 star review average. But of course the more you restrict, the less revenue you can make",
            questioner: "63cc34e35188d719fc18d097"
        },
        {
            question: "I own several restaurants in the area. Can I combine their points for this contest?",
            answer: "Actually yes. The more restaurants we have on our platform the better the system works so if you have this 'unfair advantage' feel free to use it",
            questioner: "63cc34e35188d719fc18d097"
        }
    ],
    participants: [],
})

demo.set('QUARTERMEAL_SMALL_DEADLINE', {
    grandPrize: {
        amount: contestTypes.get("SMALL").grand_prize,
        winner: null,
        participants_reached: []
    },
    lotteryPrize: {
        amount: contestTypes.get("SMALL").lottery_prize,
        winner: null
    },
    about_contest: {
        short_description:
            'Quartermeal is a new food delivery service which specializes in serving the meals faster than any competitor. We guarantee to deliver within 15 min after ordering. To achieve this we encourage our partner restaurants to only offer food which they can finalize pretty fast, as well as our innovative food boxes and driver network. Quartermeal is only available in specific urban environments. When the delivery takes longer than 15 min, the customer gets the meal for free',
        target_audience:
            'Restaurants, snacks and pubs in London within our area of business who are able to serve food extremely fast so that a driver can pick up and deliver it. You can also just put those meals of your menu on Quartermeal, which you can prepare rapidly',
        purpose:
            'We want to get our platform going, starting in London. For this we need restaurants to serve the food our drivers can deliver and our customers love to eat within 15 min',
        how_to_win: 'This is a large contest so you win if you have the most points within 45 days. There are three ways to score: 1) you have another 150 £ of revenue with your restaurant on Quartermeal, which gives you one point each 2) you get 1 point once for every order 3) you get 3 points for every 5 star review you get. To increase the likelihood of you getting orders you have to put as many good offers on our platform as possible. Great pictures and descriptions are important. You can also share your offer on social media with your followers',
        boost: 'Our delivery drivers are ready to pick up your food immediately. Also we are gonna make a huge parallel marketing campaign in social media and on wallpapers targeting people in London ordering their deliveries on Quartermeal',
        tags: ['Restaurant', 'Food Delivery', 'Rapid', 'London', 'Fast food']
    },
    requirements: {
        categories: [],
        countries: ["London - Soho"],
        roles: ["You are the owner of a restaurant"],
        additional: [{
            name:"Fast Meals",
            description: "You set up fast meals on Quartermeal.com"
        }]
    },
    about_company: {
        name: 'Quartermeal Corp',
        link: 'www.quartermeal.com',
        logo: 'https://storage.cloud.google.com/joridiro_contest/ABC/logo.png',
        description: 'We are a food delivery platform which guarantees delivery within 15 min after ordering'
    },
    _id: 'Quartermeal Medium Deadline',
    organizer: '63cce24692726a92b7690c5a',
    organizer_platform: 'https://joridiro.com/contests/create',
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().getTime() + contestTypes.get("SMALL").days * 24 * 60 * 60 * 1000).toISOString(),
    open: true,
    title: 'Grow on Quartermeal with your restaurant in London',
    banner: 'https://storage.cloud.google.com/joridiro_contest/ABC/banner.png',
    type: "DEADLINE",
    size: "SMALL",
    score: [
        {
            name: '1',
            number: 100,
            points: 1,
            measuring_unit: '€ revenue',
            description: 'Get 1 point for every 100 £ revenue',
        },
        {
            name: '1',
            number: 1,
            points: 1,
            measuring_unit: 'every order from a new customer',
            description: 'Get 1 point for every meal of you which is at least ordered once',
        }
    ],
    questions: [],
    rules: ['The delivery has to be finished within 15 min of ordering', 'You can only get one point per customer'],
    payment_status: 'PAID',
    announcements: [
        {
            announcement: "We started our big social media campaign, so you should get a boost of orders soon",
            date: new Date().toISOString()
        }
    ],
    faq: [
        {
            question: "How is it even possible to deliver within 15 min after ordering?",
            answer: "Of course this is not possible with every meal. So you have to specialize on meals which you can prepare nearly finished and just have to add the last ingredient or final roasting. We don't say it's easy but we know that customers love it when they get their food that fast. So if you're able to prepare food super fast you can reach a whole new market. Also we have an innovative new system how we organize our drivers to minimize their and your waiting time",
            questioner: "63cc34e35188d719fc18d097"
        }
    ],
    participants: [],
})

demo.set('QUARTERMEAL_LARGE_SCORE', {
    grandPrize: {
        amount: contestTypes.get("LARGE").grand_prize,
        winner: null,
        participants_reached: []
    },
    lotteryPrize: {
        amount: contestTypes.get("LARGE").lottery_prize,
        winner: null
    },
    about_contest: {
        short_description:
            'Quartermeal is a new food delivery service which specializes in serving the meals faster than any competitor. We guarantee to deliver within 15 min after ordering. To achieve this we encourage our partner restaurants to only offer food which they can finalize pretty fast, as well as our innovative food boxes and driver network. Quartermeal is only available in specific urban environments. When the delivery takes longer than 15 min, the customer gets the meal for free',
        target_audience:
            'Restaurants, snacks and pubs in London within our area of business who are able to serve food extremely fast so that a driver can pick up and deliver it. You can also just put those meals of your menu on Quartermeal, which you can prepare rapidly',
        purpose:
            'We want to get our platform going, starting in London. For this we need restaurants offering their rapid preparable meals for our hungry customers. We want to give you an incentive to come to our great platform and grow asap',
        how_to_win: 'This is a large contest so you win if you are the first to score 100 points. You score by 1) every customer who orders something from you with a total price > 25 £ (1 point) 2) every 300 £ revenue you have (2 points) 3) every 5 star review you get (1 point). To increase the likelihood of you getting orders you have to put as many good offers on our platform as possible. Great pictures and descriptions are important. You can also share your offer on social media with your followers',
        boost: 'We have a daily growing team of delivery drivers serving more and more parts of London. Also we make a parallel marketing campaign in social media and on wallpapers targeting people in London ordering their first deliveries on Quartermeal',
        tags: ['Restaurant', 'Food Delivery', 'Rapid', 'London', 'Fast food']
    },
    requirements: {
        categories: [],
        countries: ["London"],
        roles: ["You are the owner of a restaurant"],
        additional: [{
            name:"Actually yes",
            description: "The more restaurants we have on our platform the better the system works so if you have this 'unfair advantage' feel free to use it"
        }]
    },
    about_company: {
        name: 'Quartermeal Corp',
        link: 'www.quartermeal.com',
        logo: 'https://storage.cloud.google.com/joridiro_contest/ABC/logo.png',
        description: 'We are a food delivery platform which guarantees delivery within 15 min after ordering'
    },
    _id: 'Quartermeal Large Deadline',
    organizer: '63cce24692726a92b7690c5a',
    organizer_platform: 'https://joridiro.com/contests/create',
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().getTime() + contestTypes.get("LARGE").days * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
        {
            points: contestTypes.get("LARGE").milestones[0].points,
            prize : contestTypes.get("LARGE").milestones[0].prize,
            same_type : true
        },
        {
            points: contestTypes.get("LARGE").milestones[1].points,
            prize : contestTypes.get("LARGE").milestones[1].prize,
            same_type : true
        },
        {
            points: contestTypes.get("LARGE").milestones[2].points,
            prize : contestTypes.get("LARGE").milestones[2].prize,
            same_type : true
        },
    ],
    open: true,
    title: 'Grow on Quartermeal with your restaurant in London',
    banner: 'https://storage.cloud.google.com/joridiro_contest/ABC/banner.png',
    type: "SCORE",
    size: "LARGE",
    score: [
        {
            name: '1',
            number: 1,
            points: 1,
            measuring_unit: 'every order > 25 £',
            description: 'Get 1 point for every order > 25 £',
        },
        {
            name: '1',
            number: 1,
            points: 2,
            measuring_unit: 'every 300 £ revenue',
            description: 'Get 2 points for every 300 £ revenue',
        },
        {
            name: '1',
            number: 1,
            points: 1,
            measuring_unit: 'every 5 star review',
            description: 'Get 1 point for every 5 star review',
        }
    ],
    questions: [],
    rules: ['The delivery has to be finished within 15 min of ordering','You have to have at least five different customers to win the contest'],
    payment_status: 'PAID',
    announcements: [
        {
            announcement: "We started our big social media campaign, so you should get a boost of orders soon",
            date: new Date().toISOString()
        },
        {
            announcement: "We now have poster ads in the Piccadilly Circus station!",
            date: new Date().toISOString()
        }
    ],
    faq: [
        {
            question: "How is it even possible to deliver within 15 min after ordering?",
            answer: "Of course this is not possible with every meal. So you have to specialize on meals which you can prepare nearly finished and just have to add the last ingredient or final roasting. We don't say it's easy but we know that customers love it when they get their food that fast. So if you're able to prepare food super fast you can reach a whole new market. Also we have an innovative new system how we organize our drivers to minimize their and your waiting time",
            questioner: "63cc34e35188d719fc18d097"
        },
        {
            question: "What happens if the delivery takes longer than 15 min?",
            answer: "Both you and the driver don't get paid (we as well). So you can make settings in our app that restrict the driving distance to your location to whatever you think is realistic and also just take drivers who have a 5 star review average. But of course the more you restrict, the less revenue you can make",
            questioner: "63cc34e35188d719fc18d097"
        },
        {
            question: "I own several restaurants in the area. Can I combine their points for this contest?",
            answer: "Actually yes. The more restaurants we have on our platform the better the system works so if you have this 'unfair advantage' feel free to use it",
            questioner: "63cc34e35188d719fc18d097"
        }
    ],
    participants: [],
})

demo.set('QUARTERMEAL_MEDIUM_SCORE', {
    grandPrize: {
        amount: contestTypes.get("MEDIUM").grand_prize,
        winner: null,
        participants_reached: []
    },
    lotteryPrize: {
        amount: contestTypes.get("MEDIUM").lottery_prize,
        winner: null
    },
    about_contest: {
        short_description:
            'Quartermeal is a new food delivery service which specializes in serving the meals faster than any competitor. We guarantee to deliver within 15 min after ordering. To achieve this we encourage our partner restaurants to only offer food which they can finalize pretty fast, as well as our innovative food boxes and driver network. Quartermeal is only available in specific urban environments. When the delivery takes longer than 15 min, the customer gets the meal for free',
        target_audience:
            'Restaurants, snacks and pubs in London within our area of business who are able to serve food extremely fast so that a driver can pick up and deliver it. You can also just put those meals of your menu on Quartermeal, which you can prepare rapidly',
        purpose:
            'We want to get our platform going, starting in London. For this we need restaurants offering their rapid preparable meals for our hungry customers. We want to give you an incentive to come to our great platform and grow asap',
        how_to_win: 'This is a large contest so you win if you are the first to score 100 points. You score by 1) every customer who orders something from you with a total price > 25 £ (1 point) 2) every 300 £ revenue you have (2 points) 3) every 5 star review you get (1 point). To increase the likelihood of you getting orders you have to put as many good offers on our platform as possible. Great pictures and descriptions are important. You can also share your offer on social media with your followers',
        boost: 'We have a daily growing team of delivery drivers serving more and more parts of London. Also we make a parallel marketing campaign in social media and on wallpapers targeting people in London ordering their first deliveries on Quartermeal',
        tags: ['Restaurant', 'Food Delivery', 'Rapid', 'London', 'Fast food']
    },
    requirements: {
        categories: [],
        countries: ["London - Soho"],
        roles: ["You are the owner of a restaurant"],
        additional: [{
            name:"Fast Meals",
            description: "You set up fast meals on Quartermeal.com"
        }]
    },
    about_company: {
        name: 'Quartermeal Corp',
        link: 'www.quartermeal.com',
        logo: 'https://storage.cloud.google.com/joridiro_contest/ABC/logo.png',
        description: 'We are a food delivery platform which guarantees delivery within 15 min after ordering'
    },
    _id: 'Quartermeal Medium Deadline',
    organizer: '63cce24692726a92b7690c5a',
    organizer_platform: 'https://joridiro.com/contests/create',
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().getTime() + contestTypes.get("MEDIUM").days * 24 * 60 * 60 * 1000).toISOString(),
    milestones: [
        {
            points : contestTypes.get("MEDIUM").milestones[0].points,
            prize : contestTypes.get("MEDIUM").milestones[0].prize,
            same_type : true
        }
    ],
    open: true,
    title: 'Grow on Quartermeal with your restaurant in London',
    banner: 'https://storage.cloud.google.com/joridiro_contest/ABC/banner.png',
    type: "SCORE",
    size: "MEDIUM",
    score: [
        {
            name: '1',
            number: 1,
            points: 1,
            measuring_unit: 'every order > 25 £',
            description: 'Get 1 point for every order > 25 £',
        },
        {
            name: '1',
            number: 1,
            points: 2,
            measuring_unit: 'every 250 £ revenue',
            description: 'Get 2 points for every 250 £ revenue',
        }
    ],
    questions: [],
    rules: ['The delivery has to be finished within 15 min of ordering', 'You can only get one point per customer'],
    payment_status: 'PAID',
    announcements: [
        {
            announcement: "We started our big social media campaign, so you should get a boost of orders soon",
            date: new Date().toISOString()
        },
        {
            announcement: "We now have poster ads in the Piccadilly Circus station!",
            date: new Date().toISOString()
        },
        {
            announcement: "We hired another ten drivers!",
            date: new Date().toISOString()
        }
    ],
    faq: [
        {
            question: "How is it even possible to deliver within 15 min after ordering?",
            answer: "Of course this is not possible with every meal. So you have to specialize on meals which you can prepare nearly finished and just have to add the last ingredient or final roasting. We don't say it's easy but we know that customers love it when they get their food that fast. So if you're able to prepare food super fast you can reach a whole new market. Also we have an innovative new system how we organize our drivers to minimize their and your waiting time",
            questioner: "63cc34e35188d719fc18d097"
        },
        {
            question: "What happens if the delivery takes longer than 15 min?",
            answer: "Both you and the driver don't get paid (we as well). So you can make settings in our app that restrict the driving distance to your location to whatever you think is realistic and also just take drivers who have a 5 star review average. But of course the more you restrict, the less revenue you can make",
            questioner: "63cc34e35188d719fc18d097"
        }
    ],
    participants: [],
})

demo.set('QUARTERMEAL_SMALL_SCORE', {
    grandPrize: {
        amount: contestTypes.get("SMALL").grand_prize,
        winner: null,
        participants_reached: []
    },
    lotteryPrize: {
        amount: contestTypes.get("SMALL").lottery_prize,
        winner: null
    },
    about_contest: {
        short_description:
            'Quartermeal is a new food delivery service which specializes in serving the meals faster than any competitor. We guarantee to deliver within 15 min after ordering. To achieve this we encourage our partner restaurants to only offer food which they can finalize pretty fast, as well as our innovative food boxes and driver network. Quartermeal is only available in specific urban environments. When the delivery takes longer than 15 min, the customer gets the meal for free',
        target_audience:
            'Restaurants, snacks and pubs in London within our area of business who are able to serve food extremely fast so that a driver can pick up and deliver it. You can also just put those meals of your menu on Quartermeal, which you can prepare rapidly',
        purpose:
            'We want to get our platform going, starting in London. For this we need restaurants offering their rapid preparable meals for our hungry customers. We want to give you an incentive to come to our great platform and grow asap',
        how_to_win: 'This is a large contest so you win if you are the first to score 100 points. You score by 1) every customer who orders something from you with a total price > 25 £ (1 point) 2) every 300 £ revenue you have (2 points) 3) every 5 star review you get (1 point). To increase the likelihood of you getting orders you have to put as many good offers on our platform as possible. Great pictures and descriptions are important. You can also share your offer on social media with your followers',
        boost: 'We have a daily growing team of delivery drivers serving more and more parts of London. Also we make a parallel marketing campaign in social media and on wallpapers targeting people in London ordering their first deliveries on Quartermeal',
        tags: ['Restaurant', 'Food Delivery', 'Rapid', 'London', 'Fast food']
    },
    requirements: {
        categories: [],
        countries: ["London - Soho"],
        roles: ["You are the owner of a restaurant"],
        additional: [{
            name:"Fast Meals",
            description: "You set up fast meals on Quartermeal.com"
        }]
    },
    about_company: {
        name: 'Quartermeal Corp',
        link: 'www.quartermeal.com',
        logo: 'https://storage.cloud.google.com/joridiro_contest/ABC/logo.png',
        description: 'We are a food delivery platform which guarantees delivery within 15 min after ordering'
    },
    _id: 'Quartermeal Medium Deadline',
    organizer: '63cce24692726a92b7690c5a',
    organizer_platform: 'https://joridiro.com/contests/create',
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().getTime() + contestTypes.get("SMALL").days * 24 * 60 * 60 * 1000).toISOString(),
    open: true,
    title: 'Grow on Quartermeal with your restaurant in London',
    banner: 'https://storage.cloud.google.com/joridiro_contest/ABC/banner.png',
    type: "SCORE",
    size: "SMALL",
    score: [
        {
            name: '1',
            number: 1,
            points: 1,
            measuring_unit: 'every order > 25 £',
            description: 'Get 1 point for every order > 25 £',
        },
        {
            name: '1',
            number: 1,
            points: 2,
            measuring_unit: 'every 250 £ revenue',
            description: 'Get 2 points for every 250 £ revenue',
        }
    ],
    questions: [],
    rules: ['The delivery has to be finished within 15 min of ordering', 'You can only get one point per customer'],
    payment_status: 'PAID',
    announcements: [
        {
            announcement: "We started our big social media campaign, so you should get a boost of orders soon",
            date: new Date().toISOString()
        }
    ],
    faq: [
        {
            question: "How is it even possible to deliver within 15 min after ordering?",
            answer: "Of course this is not possible with every meal. So you have to specialize on meals which you can prepare nearly finished and just have to add the last ingredient or final roasting. We don't say it's easy but we know that customers love it when they get their food that fast. So if you're able to prepare food super fast you can reach a whole new market. Also we have an innovative new system how we organize our drivers to minimize their and your waiting time",
            questioner: "63cc34e35188d719fc18d097"
        }
    ],
    participants: [],
})


export default demo