const { getContacts, postContacts } = require('./ws')

async function testConnect() {
    let { data } = await getContacts('connect')
    console.log('🚀 ~ testConnect ~ data:', data)

    if (data) {
        let { data: _data } = await postContacts('connect', data.contacts)
    }
}

async function testHeist() {
    let { data } = await getContacts('heist')

    if (data) {
        let aliveContacts = data.contacts
            .filter((contact) => contact.status === 'Alive')
            .map((contact) => ({ ...contact, location: 'bank' }))
        let { data: _data } = await postContacts('heist', aliveContacts)
        console.log('🚀 ~ testConnect ~ _data:', _data)
    }
}

async function testPowers() {
    let { data } = await getContacts('powers')
    const transformations = {
        Superman: { powers: ['Laser Eyes', 'X-Ray Vision'] },
        Scarecrow: { powers: ['Toxic Immunity'], abilities: ['Pedagogy'] },
    }

    if (data) {
        let contacts = data.contacts.map((contact) => {
            if (transformations[contact.title]) {
                return { ...contact, ...transformations[contact.title] }
            }
            return contact
        })
        let { data: _data } = await postContacts('powers', contacts)
        console.log('🚀 ~ testConnect ~ _data:', _data)
    }
}

async function testBirthdays() {
    let { data } = await getContacts('birthdays')

    if (data) {
        let newContacts = []
        let maxAge = 0
        data.contacts.forEach((item, idex) => {
            if (item.age !== 'Unknown') {
                maxAge = Math.max(maxAge, item.age)

                let currentDate = new Date()
                let currentYear = currentDate.getFullYear()
                let birthYear = currentYear - item.age
                item['birthYear'] = `01-01-${birthYear}`
                newContacts.push(item)
            }
        })

        let maxAgeContact = newContacts.filter(
            (contact) => contact.age == maxAge
        )

        let { data: _data } = await postContacts('birthdays', maxAgeContact)
        console.log('🚀 ~ testConnect ~ _data:', _data)
    }
}

async function testSorting() {
    let { data } = await getContacts('sorting')

    if (data) {
        data.contacts.sort((a, b) => {
            // First, compare by title
            if (a.title < b.title) return -1
            if (a.title > b.title) return 1

            // If titles are the same, compare by age
            if (a.age < b.age) return -1
            if (a.age > b.age) return 1

            // If both title and age are the same, no change in order
            return 0
        })

        let { data: _data } = await postContacts('sorting', data.contacts)
        console.log('🚀 ~ testConnect ~ _data:', _data)
    }
}

async function test() {
    await testConnect()
    await testHeist()
    await testPowers()
    await testBirthdays()
    await testSorting()
}

test()
