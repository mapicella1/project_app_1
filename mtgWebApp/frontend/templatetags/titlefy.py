from django import template

register = template.Library()

@register.filter
def titlefy(value):
    return value.replace('_', ' ').title()
