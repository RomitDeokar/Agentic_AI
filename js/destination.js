// ============================================
// Real India Travel Destinations Database
// Authentic locations, attractions, and coordinates
// ============================================

const INDIA_DESTINATIONS = {
    'Rajasthan': {
        cities: {
            'Jaipur': {
                coords: [26.9124, 75.7873],
                attractions: [
                    { name: 'Amber Fort', coords: [26.9855, 75.8513], type: 'cultural', cost: 500, duration: '3h', rating: 4.8 },
                    { name: 'City Palace', coords: [26.9258, 75.8237], type: 'cultural', cost: 400, duration: '2h', rating: 4.7 },
                    { name: 'Hawa Mahal', coords: [26.9239, 75.8267], type: 'cultural', cost: 200, duration: '1h', rating: 4.6 },
                    { name: 'Jaigarh Fort', coords: [26.9854, 75.8516], type: 'cultural', cost: 300, duration: '2h', rating: 4.5 },
                    { name: 'Jantar Mantar', coords: [26.9246, 75.8245], type: 'cultural', cost: 200, duration: '1h', rating: 4.4 },
                    { name: 'Nahargarh Fort', coords: [26.9369, 75.8154], type: 'adventure', cost: 200, duration: '2h', rating: 4.5 },
                    { name: 'Jal Mahal', coords: [26.9539, 75.8461], type: 'relaxation', cost: 0, duration: '1h', rating: 4.3 },
                    { name: 'Albert Hall Museum', coords: [26.9117, 75.8186], type: 'cultural', cost: 300, duration: '2h', rating: 4.4 }
                ],
                hotels: ['Taj Rambagh Palace', 'Fairmont Jaipur', 'The Oberoi Rajvilas'],
                food: ['Chokhi Dhani', 'Laxmi Misthan Bhandar', 'Peacock Rooftop Restaurant']
            },
            'Udaipur': {
                coords: [24.5854, 73.7125],
                attractions: [
                    { name: 'City Palace Udaipur', coords: [24.5767, 73.6833], type: 'cultural', cost: 500, duration: '3h', rating: 4.8 },
                    { name: 'Lake Pichola Boat Ride', coords: [24.5767, 73.6811], type: 'relaxation', cost: 600, duration: '2h', rating: 4.9 },
                    { name: 'Jag Mandir', coords: [24.5706, 73.6797], type: 'cultural', cost: 400, duration: '2h', rating: 4.6 },
                    { name: 'Sajjangarh Fort', coords: [24.5925, 73.6808], type: 'cultural', cost: 300, duration: '2h', rating: 4.7 },
                    { name: 'Saheliyon Ki Bari', coords: [24.6039, 73.6914], type: 'relaxation', cost: 200, duration: '1h', rating: 4.3 },
                    { name: 'Fateh Sagar Lake', coords: [24.6089, 73.6797], type: 'relaxation', cost: 0, duration: '1h', rating: 4.5 }
                ],
                hotels: ['Taj Lake Palace', 'The Oberoi Udaivilas', 'Fateh Prakash Palace'],
                food: ['Ambrai Restaurant', 'Upre by 1559 AD', 'Jheel\'s Ginger Coffee Bar']
            },
            'Jodhpur': {
                coords: [26.2389, 73.0243],
                attractions: [
                    { name: 'Mehrangarh Fort', coords: [26.2983, 73.0178], type: 'cultural', cost: 600, duration: '3h', rating: 4.9 },
                    { name: 'Jaswant Thada', coords: [26.2970, 73.0180], type: 'cultural', cost: 200, duration: '1h', rating: 4.5 },
                    { name: 'Umaid Bhawan Palace', coords: [26.2877, 73.0396], type: 'cultural', cost: 400, duration: '2h', rating: 4.6 },
                    { name: 'Clock Tower Market', coords: [26.2918, 73.0244], type: 'shopping', cost: 0, duration: '2h', rating: 4.3 },
                    { name: 'Blue City Walking Tour', coords: [26.2967, 73.0178], type: 'cultural', cost: 300, duration: '2h', rating: 4.7 },
                    { name: 'Flying Fox Zipline', coords: [26.2983, 73.0178], type: 'adventure', cost: 1500, duration: '2h', rating: 4.8 }
                ],
                hotels: ['Umaid Bhawan Palace', 'Taj Hari Mahal', 'Raas Jodhpur'],
                food: ['On The Rocks', 'Indique', 'Gypsy Restaurant']
            },
            'Jaisalmer': {
                coords: [26.9157, 70.9083],
                attractions: [
                    { name: 'Jaisalmer Fort', coords: [26.9124, 70.9117], type: 'cultural', cost: 500, duration: '3h', rating: 4.8 },
                    { name: 'Sam Sand Dunes', coords: [26.9067, 70.6500], type: 'adventure', cost: 800, duration: '4h', rating: 4.9 },
                    { name: 'Patwon Ki Haveli', coords: [26.9114, 70.9098], type: 'cultural', cost: 300, duration: '1h', rating: 4.6 },
                    { name: 'Desert Safari & Camping', coords: [26.9067, 70.6500], type: 'adventure', cost: 2000, duration: 'overnight', rating: 4.8 },
                    { name: 'Gadisar Lake', coords: [26.9091, 70.9119], type: 'relaxation', cost: 0, duration: '1h', rating: 4.4 }
                ],
                hotels: ['Suryagarh Jaisalmer', 'Fort Rajwada', 'The Serai'],
                food: ['The Trio', 'Saffron', 'KB Cafe']
            }
        }
    },
    'Kerala': {
        cities: {
            'Kochi': {
                coords: [9.9312, 76.2673],
                attractions: [
                    { name: 'Fort Kochi', coords: [9.9667, 76.2422], type: 'cultural', cost: 0, duration: '2h', rating: 4.5 },
                    { name: 'Chinese Fishing Nets', coords: [9.9667, 76.2422], type: 'cultural', cost: 0, duration: '1h', rating: 4.3 },
                    { name: 'Mattancherry Palace', coords: [9.9580, 76.2598], type: 'cultural', cost: 200, duration: '1h', rating: 4.4 },
                    { name: 'Jewish Synagogue', coords: [9.9570, 76.2600], type: 'cultural', cost: 100, duration: '1h', rating: 4.5 },
                    { name: 'Backwater Cruise', coords: [9.9667, 76.2422], type: 'relaxation', cost: 1500, duration: '3h', rating: 4.8 }
                ],
                hotels: ['Taj Malabar', 'Brunton Boatyard', 'Forte Kochi'],
                food: ['The Rice Boat', 'Dhe Puttu', 'Kashi Art Cafe']
            },
            'Munnar': {
                coords: [10.0889, 77.0595],
                attractions: [
                    { name: 'Tea Gardens Tour', coords: [10.0889, 77.0595], type: 'relaxation', cost: 500, duration: '3h', rating: 4.7 },
                    { name: 'Eravikulam National Park', coords: [10.1333, 77.0667], type: 'adventure', cost: 600, duration: '3h', rating: 4.8 },
                    { name: 'Mattupetty Dam', coords: [10.1167, 77.1167], type: 'relaxation', cost: 200, duration: '2h', rating: 4.4 },
                    { name: 'Echo Point', coords: [10.0500, 77.1000], type: 'relaxation', cost: 100, duration: '1h', rating: 4.3 }
                ],
                hotels: ['Windermere Estate', 'Fragrant Nature', 'Tea County'],
                food: ['Saravana Bhavan', 'Rapsy Restaurant', 'Hotel Copper Castle']
            },
            'Alleppey': {
                coords: [9.4981, 76.3389],
                attractions: [
                    { name: 'Houseboat Experience', coords: [9.4981, 76.3389], type: 'relaxation', cost: 8000, duration: 'overnight', rating: 4.9 },
                    { name: 'Alleppey Beach', coords: [9.4833, 76.3333], type: 'relaxation', cost: 0, duration: '2h', rating: 4.3 },
                    { name: 'Backwater Village Tour', coords: [9.4981, 76.3389], type: 'cultural', cost: 1000, duration: '3h', rating: 4.6 }
                ],
                hotels: ['Punnamada Resort', 'Lemon Tree Vembanad Lake', 'Ramada Alleppey'],
                food: ['Thaff Delicacy', 'Harbour Restaurant', 'Dreamers Cafe']
            }
        }
    },
    'Goa': {
        cities: {
            'North Goa': {
                coords: [15.5167, 73.8167],
                attractions: [
                    { name: 'Calangute Beach', coords: [15.5500, 73.7544], type: 'relaxation', cost: 0, duration: '3h', rating: 4.4 },
                    { name: 'Fort Aguada', coords: [15.4917, 73.7736], type: 'cultural', cost: 100, duration: '1h', rating: 4.5 },
                    { name: 'Baga Beach Water Sports', coords: [15.5553, 73.7519], type: 'adventure', cost: 2000, duration: '2h', rating: 4.6 },
                    { name: 'Saturday Night Market', coords: [15.5642, 73.7458], type: 'shopping', cost: 0, duration: '3h', rating: 4.5 },
                    { name: 'Anjuna Flea Market', coords: [15.5736, 73.7403], type: 'shopping', cost: 0, duration: '2h', rating: 4.4 }
                ],
                hotels: ['Taj Fort Aguada', 'Alila Diwa Goa', 'The Leela Goa'],
                food: ['Thalassa', 'Curlies', 'Britto\'s']
            },
            'South Goa': {
                coords: [15.2993, 74.1240],
                attractions: [
                    { name: 'Palolem Beach', coords: [15.0100, 74.0233], type: 'relaxation', cost: 0, duration: '3h', rating: 4.7 },
                    { name: 'Dudhsagar Falls', coords: [15.3142, 74.3144], type: 'adventure', cost: 1500, duration: '5h', rating: 4.8 },
                    { name: 'Cabo de Rama Fort', coords: [15.0847, 73.9158], type: 'cultural', cost: 0, duration: '1h', rating: 4.4 },
                    { name: 'Butterfly Beach', coords: [15.0100, 74.0000], type: 'relaxation', cost: 0, duration: '2h', rating: 4.6 }
                ],
                hotels: ['The Lalit Golf & Spa Resort', 'Alila Diwa Goa', 'Park Hyatt Goa'],
                food: ['Martin\'s Corner', 'Fisherman\'s Wharf', 'Zeebop']
            }
        }
    },
    'Delhi': {
        cities: {
            'New Delhi': {
                coords: [28.6139, 77.2090],
                attractions: [
                    { name: 'Red Fort', coords: [28.6562, 77.2410], type: 'cultural', cost: 500, duration: '2h', rating: 4.6 },
                    { name: 'Qutub Minar', coords: [28.5245, 77.1855], type: 'cultural', cost: 500, duration: '2h', rating: 4.7 },
                    { name: 'India Gate', coords: [28.6129, 77.2295], type: 'cultural', cost: 0, duration: '1h', rating: 4.5 },
                    { name: 'Humayun\'s Tomb', coords: [28.5933, 77.2507], type: 'cultural', cost: 500, duration: '2h', rating: 4.7 },
                    { name: 'Lotus Temple', coords: [28.5535, 77.2588], type: 'cultural', cost: 0, duration: '1h', rating: 4.6 },
                    { name: 'Akshardham Temple', coords: [28.6127, 77.2773], type: 'cultural', cost: 0, duration: '3h', rating: 4.8 },
                    { name: 'Chandni Chowk Food Walk', coords: [28.6506, 77.2303], type: 'food', cost: 800, duration: '3h', rating: 4.7 }
                ],
                hotels: ['The Imperial', 'Taj Palace', 'The Oberoi Delhi'],
                food: ['Indian Accent', 'Bukhara', 'Karim\'s']
            }
        }
    },
    'Agra': {
        cities: {
            'Agra': {
                coords: [27.1767, 78.0081],
                attractions: [
                    { name: 'Taj Mahal', coords: [27.1751, 78.0421], type: 'cultural', cost: 1000, duration: '3h', rating: 5.0 },
                    { name: 'Agra Fort', coords: [27.1795, 78.0211], type: 'cultural', cost: 600, duration: '2h', rating: 4.7 },
                    { name: 'Mehtab Bagh', coords: [27.1793, 78.0455], type: 'relaxation', cost: 200, duration: '1h', rating: 4.5 },
                    { name: 'Fatehpur Sikri', coords: [27.0945, 77.6661], type: 'cultural', cost: 500, duration: '3h', rating: 4.6 }
                ],
                hotels: ['The Oberoi Amarvilas', 'ITC Mughal', 'Taj Hotel & Convention Centre'],
                food: ['Pinch of Spice', 'Joney\'s Place', 'Esphahan']
            }
        }
    }
};

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { INDIA_DESTINATIONS };
}
