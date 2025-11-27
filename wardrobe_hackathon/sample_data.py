# sample_data.py
from models import init_db, SessionLocal
import models, crud
import datetime

def seed():
    init_db()
    # create sample clothes
    a = crud.create_clothes("흰 셔츠", "top", seasons=["spring","summer","fall"], color="white")
    b = crud.create_clothes("검정 슬랙스", "bottom", seasons=["all"], color="black")
    c = crud.create_clothes("회색 후드", "top", seasons=["fall","winter"], color="gray")
    d = crud.create_clothes("청바지", "bottom", seasons=["all"], color="blue")
    # add wear logs
    today = datetime.date.today()
    crud.add_wear_log(today - datetime.timedelta(days=10), [a.id, b.id])
    crud.add_wear_log(today - datetime.timedelta(days=8), [c.id, d.id])
    crud.add_wear_log(today - datetime.timedelta(days=5), [a.id, b.id])
    crud.add_wear_log(today - datetime.timedelta(days=2), [a.id, d.id])
    print("seed done.")

if __name__ == "__main__":
    seed()
