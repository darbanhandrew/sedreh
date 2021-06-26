from django import forms
from .models import Order


class OrderForm(forms.ModelForm):
    class Meta:
        model = Order
        fields = [
            'title',
            'region',
            'from_date',
            'to_date',
            'pollutants',
            'description',
            'user',
        ]
        labels = {
            'title': 'نام',
            'region': 'محدوده مورد نظر خود را انتخاب کنید',
            'from_date': 'زمان مورد نظر خود را انتخاب کنید',
            'to_date': '',
            'pollutants': 'آلاینده مورد نظر خود را انتخاب کنید',
            'description': 'توضیحات',
            'user': 'کاربر',
        }
