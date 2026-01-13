from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from .models import PlotActivity, SensorReading, SimPayment, Station, StationImage, User, WeatherForecast


def minutes_ago(minutes: int) -> datetime:
    return datetime.utcnow() - timedelta(minutes=minutes)


def seed_users(session: Session) -> None:
    if session.query(User).first():
        return

    users = [
        User(
            id="user-001",
            username="admin",
            password="admin123",
            role="Admin",
            full_name="ผู้ดูแลระบบ",
            email="admin@wimarc.example",
            is_enabled=True,
            permitted_station_ids=[],
            created_at=datetime(2024, 1, 1),
        ),
        User(
            id="user-002",
            username="user1",
            password="user123",
            role="User",
            full_name="สมชาย ใจดี",
            email="somchai@example.com",
            is_enabled=True,
            permitted_station_ids=["station-019", "station-022"],
            created_at=datetime(2024, 2, 1),
        ),
        User(
            id="user-003",
            username="user2",
            password="user123",
            role="User",
            full_name="สมหญิง รักสวน",
            email="somying@example.com",
            is_enabled=True,
            permitted_station_ids=["station-012", "station-027"],
            created_at=datetime(2024, 2, 15),
        ),
        User(
            id="user-004",
            username="guest1",
            password="guest123",
            role="Guest",
            full_name="ผู้เยี่ยมชม 1",
            email="guest1@example.com",
            is_enabled=True,
            permitted_station_ids=["station-019", "station-022"],
            created_at=datetime(2024, 3, 1),
        ),
    ]

    session.add_all(users)
    session.commit()


def seed_stations(session: Session) -> None:
    if session.query(Station).first():
        return

    stations = [
        Station(
            id="station-001",
            name="ต.นายายอาม อ.นายายอาม จ.จันทบุรี",
            type="weather",
            owner_id="user-002",
            latitude=12.6784292,
            longitude=101.8622002,
            status="online",
            last_data_time=minutes_ago(5),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.นายายอาม อ.นายายอาม จ.จันทบุรี",
        ),
        Station(
            id="station-002",
            name="ต.กระแจะ อ.นายายอาม จ.จันทบุรี",
            type="soil",
            owner_id="user-002",
            latitude=12.6784272,
            longitude=101.8616004,
            status="online",
            last_data_time=minutes_ago(7),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.กระแจะ อ.นายายอาม จ.จันทบุรี",
        ),
        Station(
            id="station-003",
            name="ต.คลองพลู อ.เขาคิชฌกูฏ จ.จันทบุรี",
            type="weather",
            owner_id="user-002",
            latitude=12.9660625,
            longitude=102.0817759,
            status="online",
            last_data_time=minutes_ago(9),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.คลองพลู อ.เขาคิชฌกูฏ จ.จันทบุรี",
        ),
        Station(
            id="station-004",
            name="ต.คลองพลู อ.เขาคิชฌกูฏ จ.จันทบุรี",
            type="soil",
            owner_id="user-002",
            latitude=12.9661127,
            longitude=102.0814173,
            status="online",
            last_data_time=minutes_ago(12),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.คลองพลู อ.เขาคิชฌกูฏ จ.จันทบุรี",
        ),
        Station(
            id="station-005",
            name="ต.เขาบายศรี อ.ท่าใหม่ จ.จันทบุรี",
            type="weather",
            owner_id="user-002",
            latitude=12.779292,
            longitude=102.0733491,
            status="online",
            last_data_time=minutes_ago(15),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.เขาบายศรี อ.ท่าใหม่ จ.จันทบุรี",
        ),
        Station(
            id="station-006",
            name="ต.เขารูปช้าง อ.เขาคิชฌกูฏ จ.จันทบุรี",
            type="soil",
            owner_id="user-002",
            latitude=12.84062,
            longitude=102.0309581,
            status="online",
            last_data_time=minutes_ago(18),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.เขารูปช้าง อ.เขาคิชฌกูฏ จ.จันทบุรี",
        ),
        Station(
            id="station-007",
            name="ต.เขาพลอยแหวน อ.ท่าใหม่ จ.จันทบุรี",
            type="weather",
            owner_id="user-002",
            latitude=12.610636,
            longitude=102.0408721,
            status="online",
            last_data_time=minutes_ago(21),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.เขาพลอยแหวน อ.ท่าใหม่ จ.จันทบุรี",
        ),
        Station(
            id="station-008",
            name="ต.ห้วยทับมอญ อ.เขาชะเมา จ.ระยอง",
            type="soil",
            owner_id="user-002",
            latitude=12.9965665,
            longitude=101.6808925,
            status="offline",
            last_data_time=minutes_ago(240),
            area="ระยอง",
            description="จุดติดตั้ง ต.ห้วยทับมอญ อ.เขาชะเมา จ.ระยอง",
        ),
        Station(
            id="station-009",
            name="ต.ท่าโสม อ.เขาสมิง จ.ตราด",
            type="weather",
            owner_id="user-002",
            latitude=12.4488629,
            longitude=102.4283024,
            status="online",
            last_data_time=minutes_ago(24),
            area="ตราด",
            description="จุดติดตั้ง ต.ท่าโสม อ.เขาสมิง จ.ตราด",
        ),
        Station(
            id="station-010",
            name="ต.กองดิน อ.แกลง จ.ระยอง",
            type="soil",
            owner_id="user-002",
            latitude=12.8019933,
            longitude=101.761361,
            status="online",
            last_data_time=minutes_ago(27),
            area="ระยอง",
            description="จุดติดตั้ง ต.กองดิน อ.แกลง จ.ระยอง",
        ),
        Station(
            id="station-011",
            name="ต.พลวง อ.เขาคิชฌกูฏ จ.จันทบุรี",
            type="weather",
            owner_id="user-002",
            latitude=12.7953271,
            longitude=102.1166199,
            status="online",
            last_data_time=minutes_ago(30),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.พลวง อ.เขาคิชฌกูฏ จ.จันทบุรี",
        ),
        Station(
            id="station-012",
            name="ต.แสลง อ.เมือง จ.จันทบุรี",
            type="soil",
            owner_id="user-002",
            latitude=12.727039,
            longitude=102.100952,
            status="online",
            last_data_time=minutes_ago(33),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.แสลง อ.เมือง จ.จันทบุรี",
        ),
        Station(
            id="station-013",
            name="ต.ประณีต อ.เขาสมิง จ.ตราด",
            type="weather",
            owner_id="user-002",
            latitude=12.5456661,
            longitude=102.3551795,
            status="online",
            last_data_time=minutes_ago(36),
            area="ตราด",
            description="จุดติดตั้ง ต.ประณีต อ.เขาสมิง จ.ตราด",
        ),
        Station(
            id="station-014",
            name="ต.ตึ้ง อ.ขลุง จ.จันทบุรี",
            type="soil",
            owner_id="user-002",
            latitude=12.5067224,
            longitude=102.2533235,
            status="offline",
            last_data_time=minutes_ago(300),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.ตึ้ง อ.ขลุง จ.จันทบุรี",
        ),
        Station(
            id="station-015",
            name="ต.จันทเขลม อ.เขาคิชฌกูฏ จ.จันทบุรี",
            type="weather",
            owner_id="user-002",
            latitude=13.0498823,
            longitude=102.015263,
            status="online",
            last_data_time=minutes_ago(39),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.จันทเขลม อ.เขาคิชฌกูฏ จ.จันทบุรี",
        ),
        Station(
            id="station-016",
            name="ต.ตะเคียนทอง อ.เขาคิชฌกูฏ จ.จันทบุรี",
            type="soil",
            owner_id="user-002",
            latitude=12.9312227,
            longitude=102.0736062,
            status="online",
            last_data_time=minutes_ago(42),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.ตะเคียนทอง อ.เขาคิชฌกูฏ จ.จันทบุรี",
        ),
        Station(
            id="station-017",
            name="ต.ฉมัน อ.มะขาม จ.จันทบุรี",
            type="weather",
            owner_id="user-002",
            latitude=12.796557,
            longitude=102.230057,
            status="online",
            last_data_time=minutes_ago(45),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.ฉมัน อ.มะขาม จ.จันทบุรี",
        ),
        Station(
            id="station-018",
            name="ต.ทุ่งเบญจา อ.ท่าใหม่ จ.จันทบุรี",
            type="soil",
            owner_id="user-002",
            latitude=12.8253939,
            longitude=101.9878307,
            status="online",
            last_data_time=minutes_ago(48),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.ทุ่งเบญจา อ.ท่าใหม่ จ.จันทบุรี",
        ),
        Station(
            id="station-019",
            name="ต.สองพี่น้อง อ.ท่าใหม่ จ.จันทบุรี",
            type="weather",
            owner_id="user-002",
            latitude=12.7043199,
            longitude=101.9946768,
            status="online",
            last_data_time=minutes_ago(51),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.สองพี่น้อง อ.ท่าใหม่ จ.จันทบุรี",
        ),
        Station(
            id="station-020",
            name="ต.คลองพลู อ.เขาคิชฌกูฏ จ.จันทบุรี",
            type="soil",
            owner_id="user-002",
            latitude=12.881961,
            longitude=102.013943,
            status="offline",
            last_data_time=minutes_ago(360),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.คลองพลู อ.เขาคิชฌกูฏ จ.จันทบุรี",
        ),
        Station(
            id="station-021",
            name="ต.ทุ่งเบญจา อ.ท่าใหม่ จ.จันทบุรี",
            type="weather",
            owner_id="user-002",
            latitude=12.8258683,
            longitude=101.9714885,
            status="online",
            last_data_time=minutes_ago(54),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.ทุ่งเบญจา อ.ท่าใหม่ จ.จันทบุรี",
        ),
        Station(
            id="station-022",
            name="ต.สองพี่น้อง อ.ท่าใหม่ จ.จันทบุรี",
            type="soil",
            owner_id="user-002",
            latitude=12.7043199,
            longitude=101.9946768,
            status="online",
            last_data_time=minutes_ago(57),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.สองพี่น้อง อ.ท่าใหม่ จ.จันทบุรี",
        ),
        Station(
            id="station-023",
            name="ต.ปัถวี อ.มะขาม จ.จันทบุรี",
            type="weather",
            owner_id="user-002",
            latitude=12.6732726,
            longitude=102.1979421,
            status="online",
            last_data_time=minutes_ago(60),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.ปัถวี อ.มะขาม จ.จันทบุรี",
        ),
        Station(
            id="station-024",
            name="ต.มะขาม อ.มะขาม จ.จันทบุรี",
            type="soil",
            owner_id="user-002",
            latitude=12.7523077,
            longitude=102.2061986,
            status="online",
            last_data_time=minutes_ago(63),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.มะขาม อ.มะขาม จ.จันทบุรี",
        ),
        Station(
            id="station-025",
            name="ต.วังแซ้ม อ.มะขาม จ.จันทบุรี",
            type="weather",
            owner_id="user-002",
            latitude=12.772476,
            longitude=102.1814381,
            status="online",
            last_data_time=minutes_ago(66),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.วังแซ้ม อ.มะขาม จ.จันทบุรี",
        ),
        Station(
            id="station-026",
            name="ต.ชากไทย อ.เขาคิชฌกูฏ จ.จันทบุรี",
            type="soil",
            owner_id="user-002",
            latitude=12.788142,
            longitude=102.0780011,
            status="offline",
            last_data_time=minutes_ago(420),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.ชากไทย อ.เขาคิชฌกูฏ จ.จันทบุรี",
        ),
        Station(
            id="station-027",
            name="ต.แสลง อ.เมือง จ.จันทบุรี",
            type="weather",
            owner_id="user-002",
            latitude=12.727039,
            longitude=102.100952,
            status="online",
            last_data_time=minutes_ago(69),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.แสลง อ.เมือง จ.จันทบุรี",
        ),
        Station(
            id="station-028",
            name="ต.พลิ้ว อ.แหลมสิงห์ จ.จันทบุรี",
            type="soil",
            owner_id="user-002",
            latitude=12.5097771,
            longitude=102.1655456,
            status="online",
            last_data_time=minutes_ago(72),
            area="จันทบุรี",
            description="จุดติดตั้ง ต.พลิ้ว อ.แหลมสิงห์ จ.จันทบุรี",
        ),
        Station(
            id="station-029",
            name="ต.ทางเกวียน อ.แกลง จ.ระยอง",
            type="weather",
            owner_id="user-002",
            latitude=12.816691,
            longitude=101.5916101,
            status="online",
            last_data_time=minutes_ago(75),
            area="ระยอง",
            description="จุดติดตั้ง ต.ทางเกวียน อ.แกลง จ.ระยอง",
        ),
        Station(
            id="station-030",
            name="ต.ทุ่งนนทรี อ.เขาสมิง จ.ตราด",
            type="soil",
            owner_id="user-002",
            latitude=12.3798478,
            longitude=102.4365476,
            status="online",
            last_data_time=minutes_ago(78),
            area="ตราด",
            description="จุดติดตั้ง ต.ทุ่งนนทรี อ.เขาสมิง จ.ตราด",
        ),
    ]

    session.add_all(stations)
    session.commit()


def seed_station_images(session: Session) -> None:
    if session.query(StationImage).first():
        return

    stations = session.query(Station).order_by(Station.id).all()
    images = [
        StationImage(
            id=f"image-{idx + 1:03d}",
            station_id=station.id,
            image_url="/placeholder.svg?height=480&width=640",
            timestamp=minutes_ago(5 + idx * 3),
        )
        for idx, station in enumerate(stations)
    ]

    session.add_all(images)
    session.commit()


def seed_sim_payments(session: Session) -> None:
    if session.query(SimPayment).first():
        return

    payments = [
        SimPayment(
            id="sim-001",
            station_id="station-001",
            station_name="ต.นายายอาม อ.นายายอาม จ.จันทบุรี",
            sim_number="089-xxx-1234",
            provider="AIS",
            amount=350.0,
            due_date=date.today() + timedelta(days=15),
            status="pending",
        ),
        SimPayment(
            id="sim-002",
            station_id="station-019",
            station_name="ต.สองพี่น้อง อ.ท่าใหม่ จ.จันทบุรี",
            sim_number="089-xxx-5678",
            provider="TRUE",
            amount=420.0,
            due_date=date.today() - timedelta(days=2),
            status="pending",
        ),
        SimPayment(
            id="sim-003",
            station_id="station-027",
            station_name="ต.แสลง อ.เมือง จ.จันทบุรี",
            sim_number="089-xxx-9012",
            provider="DTAC",
            amount=390.0,
            due_date=date.today() - timedelta(days=10),
            status="paid",
            paid_date=date.today() - timedelta(days=7),
            notes="ชำระผ่านโอนเงิน",
        ),
    ]

    session.add_all(payments)
    session.commit()


def seed_weather_forecasts(session: Session) -> None:
    if session.query(WeatherForecast).first():
        return

    weather_stations = session.query(Station).filter(Station.type == "weather").all()
    forecasts = []
    for station in weather_stations:
        for day in range(4):
            forecast_date = date.today() + timedelta(days=day)
            forecasts.append(
                WeatherForecast(
                    id=f"forecast-{station.id}-{day}",
                    station_id=station.id,
                    forecast_date=forecast_date,
                    temperature=28.0 + day,
                    rain_probability=20.0 + day * 5,
                    rainfall=2.0 + day * 0.5,
                    description="มีเมฆบางส่วน",
                )
            )

    session.add_all(forecasts)
    session.commit()


def seed_sensor_readings(session: Session) -> None:
    if session.query(SensorReading).first():
        return

    stations = session.query(Station).all()
    readings = []
    for station in stations:
        for offset in range(3):
            timestamp = datetime.utcnow() - timedelta(hours=offset * 3)
            if station.type == "weather":
                readings.append(
                    SensorReading(
                        id=f"reading-{station.id}-{offset}",
                        station_id=station.id,
                        timestamp=timestamp,
                        air_temperature=28.5 + offset,
                        relative_humidity=75.0 - offset,
                        light_intensity=32000 + offset * 500,
                        wind_direction=180,
                        wind_speed=2.5 + offset * 0.2,
                        rainfall=0.0,
                        atmospheric_pressure=1012.5,
                        vpd=1.1 + offset * 0.05,
                    )
                )
            else:
                readings.append(
                    SensorReading(
                        id=f"reading-{station.id}-{offset}",
                        station_id=station.id,
                        timestamp=timestamp,
                        soil_moisture1=52.0 - offset,
                        soil_moisture2=49.0 - offset * 0.8,
                    )
                )

    session.add_all(readings)
    session.commit()


def seed_activities(session: Session) -> None:
    if session.query(PlotActivity).first():
        return

    activities = [
        PlotActivity(
            id="activity-001",
            station_id="station-019",
            date=date.today() - timedelta(days=2),
            activity_type="รดน้ำ",
            description="รดน้ำช่วงเช้า 50 ลิตรต่อต้น",
            created_by="user-002",
            created_by_name="สมชาย ใจดี",
            created_at=datetime.utcnow() - timedelta(days=2, hours=2),
            images=["/placeholder.svg?height=300&width=400"],
        ),
        PlotActivity(
            id="activity-002",
            station_id="station-027",
            date=date.today() - timedelta(days=5),
            activity_type="ใส่ปุ๋ย",
            description="ใส่ปุ๋ยสูตร 15-15-15",
            created_by="user-003",
            created_by_name="สมหญิง รักสวน",
            created_at=datetime.utcnow() - timedelta(days=5, hours=1),
            images=[],
        ),
    ]

    session.add_all(activities)
    session.commit()


def seed_data(session: Session) -> None:
    seed_users(session)
    seed_stations(session)
    seed_station_images(session)
    seed_sim_payments(session)
    seed_weather_forecasts(session)
    seed_sensor_readings(session)
    seed_activities(session)
