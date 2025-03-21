const firstNames = [
    'John', 'Jane', 'Jack', 'Jill', 'James', 'Jenny', 'Jared', 'Jade', 'Jasper', 'Jasmine', 'Jaxon',
    'Jade', 'Jesse', 'Jocelyn', 'Jude', 'Juno', 'Jupiter', 'Jett', 'Jewel', 'Jax', 'Journey', 'Jagger', 'Jewel', 'Jewel', 'Jewel'
]

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson',
    'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker'
]

// descriptions: "part1, part2"
const descriptionsPart1 = [
    'With 14 years experience in the industry, ',
    'Ive had hands on experience for 10 years. ',
    'I\'ve been doing this type of work since 2011, ',
    'After learning from local experts in my community, ',
    'I\'ve picked up many skills on the job over the years, ',
    'Having worked in different neighborhoods across town, ',
    'From helping family to making it my livelihood, ',
    'Started as a side job and became my main hustle, ',
    'I\'ve built up my reputation through word of mouth, ',
    'After years of figuring things out on my own, ',
    'I bring my own tools and know-how to every job, ',
    'Having learned through trial and error since 2015, ',
    'With a knack for solving everyday problems, ',
    'After watching and working alongside others in the trade, ',
    'I\'ve handled all kinds of situations in this line of work, ',
    'From simple jobs to more complex projects, ',
    'Having built my skills one job at a time, ',
    'Known in my community for reliable service since 2013, ',
    'I\'ve developed my own methods that get results, ',
    'Self-taught and proud of the work I deliver, '
]

const descriptionsPart2 = [
    'I\'ve got the skills to get the job done right.',
    'I can handle any task you throw my way.',
    'I\'m ready to tackle your next project.',
    'I\'m the right person for the job.',
    'You can count on me to deliver quality work.',
    'I\'ll make sure you\'re satisfied with the results.',
    'I pride myself on being reliable and efficient.',
    'I won\'t leave until the job is done properly.',
    'My customers always come back for more work.',
    'I offer fair prices for honest work.',
    'I\'m known for paying attention to the details.',
    'I work quickly but never cut corners.',
    'You\'ll be happy you chose me for this job.',
    'I show up on time and get straight to work.',
    'I bring everything needed to finish the job.',
    'I\'ll treat your property with respect.',
    'I\'m not satisfied until you\'re happy with my work.',
    'My reputation depends on doing good work for folks like you.',
    'I\'ll explain everything as I go along.',
    'I\'m just a call away if you need anything fixed.'
]

const tagData = [
    ["Pretoria", "Johannesburg", "Cape Town", "Durban", "Port Elizabeth", "Bloemfontein", "East London", "Polokwane", "Nelspruit", "Kimberley", "Rustenburg", "Pietermaritzburg", "Mafikeng", "Vryburg", "Klerksdorp", "Welkom", "Kroonstad", "Bethlehem", "Harrismith", "Richards Bay", "Empangeni", "Ladysmith", "Newcastle", "Utrecht", "Middelburg", "Witbank", "Secunda", "Standerton", "Ermelo", "Lydenburg", "Phalaborwa", "Musina", "Thohoyandou", "Tzaneen", "Giyani", "Barberton"],
    ["Painter", "Builder", "Mover", "Driver", "Plumber", "Electrician", "Handyman", "Gardener", "Cleaner", "Carpenter", "Welder", "Mechanic", "Tiler", "Roofer", "Paver", "Landscaper"],
    ["Accepts Card", "Cash Only", "Free Quotes", "Licensed"],
]

export function useRandomGigCardData() {

    return {
        generateDetails() {
            const randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)]
            const randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)]
            const randomDescriptionPart1 = descriptionsPart1[Math.floor(Math.random() * descriptionsPart1.length)]
            const randomDescriptionPart2 = descriptionsPart2[Math.floor(Math.random() * descriptionsPart2.length)]
            const randomTag1 = tagData[0][Math.floor(Math.random() * tagData[0].length)]
            const randomTag2 = tagData[1][Math.floor(Math.random() * tagData[1].length)]
            const randomTag3 = tagData[2][Math.floor(Math.random() * tagData[2].length)]

            const name = `${randomFirstName} ${randomLastName}`;
            const description = `${randomDescriptionPart1} ${randomDescriptionPart2}`;
            const tags = [randomTag1, randomTag2, randomTag3];

            return {
                name,
                description,
                tags
            }
        }
    }
}