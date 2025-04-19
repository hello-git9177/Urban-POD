import requests

def test_booking():
    url = 'http://localhost:5000/booking'
    data = {
        'name': 'John Doe',
        'startingPoint': 'BVRIT College',
        'destination': 'Miyapur'
    }
    response = requests.post(url, json=data)
    print(response.json())


def test_get_bookings():
    url = 'http://localhost:5000/get_bookings'
    response = requests.get(url)
    print(response.json())


if __name__ == '__main__':
    test_booking()
    test_get_bookings()