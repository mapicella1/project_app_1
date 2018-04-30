import urllib
import csv
import re
import random
import lxml
import bs4
import httplib2
import os.path
import time
from pathlib import Path
from urllib.request import urlopen as uReq
from bs4 import BeautifulSoup as soup

card_values = ['Card_Name', 'Mana_Cost', 'Converted_Mana_Cost', 'Types', 'Subtypes', 'Card_Text',
               'Flavor_Text', 'Watermark', 'Loyalty', 'P', 'T', 'Expansion', 'Rarity', 'All_Sets',
               'Card_Number', 'Artist', 'Trans_Card', 'Other_Sets', 'Color_Indicator',
                   'Linked_Card', 'Hand/Life', 'Modern', 'Legacy', 'Vintage', 'Commander', 'UnSets', 'Standard']
cards_path = Path('./cards.csv')
if not cards_path.is_file():
    print("new file")
    with open('cards.csv', 'a', encoding='utf8', newline='') as csvfile:
        scrapeTo = csv.DictWriter(csvfile, fieldnames=card_values)
        scrapeTo.writer.writerow(card_values)

def getLegal (cardArray, infoArray, legalLink):
    legalURL = 'http://gatherer.wizards.com/Pages/Card/' + legalLink
    legalClient = uReq(legalURL)
    legal_html = legalClient.read()
    legal_soup = soup(legal_html, "lxml")

    table = legal_soup.findAll("table", {"class": "cardList"})
    rows = table[1].select("tr[class^=cardItem]")
    try:
        for row in rows:
            if 'Block' in row.td.text:
                continue
            if '-' in row.td.text.strip():
                infoArray.append(row.td.text.strip().replace('-', ''))
            else:
                infoArray.append(row.td.text.strip())
            cardArray.append(row.td.next_sibling.next_sibling.text.strip())
    except AttributeError:
        pass
    legalClient.close()
    return cardArray, infoArray


def getMana (manaDiv):
    manaString = ""
    for thing in manaDiv.findAll("img"):
        manaString += " " + '{'+thing["alt"]+'}'
        # symbolFile = Path('Images/Symbol/' + thing["alt"] + '.jpg')
        # if not symbolFile.is_file():
        #     f = open('Images/Symbol/' + thing["alt"] + '.jpg', 'wb')
        #     f.write(uReq(siteURL + thing["src"]).read())
        #     f.close()
    return manaString


def getSet (set):
    setTitle = set["title"].replace(":", "")
    setFile = Path('Images/Set/' + setTitle.replace('"', '') + '.jpg')
    if not setFile.is_file():
        f = open('Images/Set/' + setTitle.replace('"', '') + '.jpg', 'wb')
        f.write(uReq(siteURL + set["src"][5:]).read())
        f.close()


def getCardStuff (cardInfo, infoTypes, abilityMana):
    infoArray = []
    cardArray = []
    for i in range(0, len(cardInfo)):
        if infoTypes[i].text.strip().replace(":", "") == 'Types':
            sepTypes = cardInfo[i].text.strip().split(u'\u2014')
            infoArray.append('Types')
            cardArray.append(sepTypes[0].strip())
        elif infoTypes[i].text.strip().replace(":", "") == 'All Sets':
            setString = ''
            for img in cardInfo[i].findAll('img'):
                getSet(img)
                setString += img["alt"] + ","
            infoArray.append('All Sets')
            cardArray.append(setString.strip())
        elif infoTypes[i].text.strip().replace(":", "") == 'Card Text':
            newText = ''
            for k, item in enumerate(abilityMana):
                textArray = item.contents
                for j, content in enumerate(textArray):
                    iTagString = ''
                    if '<img' in str(content):
                        try:
                            textArray[j] = '{'+content["alt"]+'}'
                        except KeyError:
                            iTagString = '{' + content.img["alt"] + '}'
                    try:
                        newText += textArray[j]
                    except TypeError:
                        newText += iTagString + textArray[j].text.strip()
                if len(abilityMana) > 1 and k != (len(abilityMana)-1):
                    newText += '|'
            infoArray.append('Card Text')
            cardArray.append(newText)
        else:
            infoArray.append(infoTypes[i].text.strip().replace(":", ""))
            cardArray.append(cardInfo[i].text.strip().replace('"', ''))
    infoArray.append('Subtypes')
    try:
        cardArray.append(sepTypes[1])
    except IndexError:
        cardArray.append(None)

    return infoArray, cardArray


def card_parse (card_soup, cardImage, legalLink):
    csvDict = {}
    manaString = ""
    abilityManaString = ""
    cardTable = card_soup.find("td", {"class": "rightCol"})
    cardDiv = cardTable.find("div", {"style": "margin-top: 5px;"})
    cardInfo = cardDiv.findAll("div", {"class": "value"})
    infoTypes = cardDiv.findAll("div", {"class": "label"})
    manaCost = cardDiv.find("div", {"class": "row manaRow"})
    abilityMana = cardTable.findAll("div", {"class": "cardtextbox"})

    setImg = cardTable.find("div", {"id": "ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_currentSetSymbol"})
    set = setImg.a.img
    getSet(set)

    # store card attirbute text values to array
    infoArray, cardArray = getCardStuff(cardInfo, infoTypes, abilityMana)

    cardArray, infoArray = getLegal(cardArray, infoArray, legalLink)

    # check for mana cost, add symbol if exists
    try:
        mana = manaCost.find("div", {"class": "value"})
        manaString += " " + getMana(mana)
        abilityManaString.strip()
        cardArray[1] = manaString.strip()
    except AttributeError:
        pass

    # get card image
    # image_name = cardArray[0].replace('"', '')
    # image_name = image_name.replace(':', '')
    # cardFile = Path('Images/Card/' + image_name.replace('?', '').replace('//', '') + '.jpg')
    # if not cardFile.is_file():
    #     f = open('Images/Card/' + image_name + '.jpg', 'wb')
    #     f.write(uReq(siteURL + cardImage[5:]).read())
    #     f.close()

    # create dictionary for writing
    for i in range(0, len(cardArray)):
        # print(cardArray[i])
        if infoArray[i] == 'P/T':
            p, t = cardArray[i].split('/')
            csvDict['P'] = p
            csvDict['T'] = t
        else:
            csvDict[infoArray[i].replace(" ", "_")] = cardArray[i]
    with open('cards.csv', 'a', encoding='utf8', newline='') as csvfile:
        scrapeTo = csv.DictWriter(csvfile, fieldnames=card_values)
        scrapeTo.writerow(csvDict)
    return


def flip_card_parse1 (card_soup, legalLink):
    csvDict = {}
    manaString = ""
    abilityManaString = ""
    cardImage = card_soup.find("td", {"class": "leftCol"}).img["src"]
    cardTable = card_soup.find("table", {"class": "cardDetails cardComponent"})
    cardTD = cardTable.find("td", id=re.compile("rightCol$"))
    cardInfo = cardTD.findAll("div", {"class": "value"})
    infoTypes = cardTD.findAll("div", {"class": "label"})
    manaCost = cardTD.find("div", id=re.compile("manaRow$"))
    abilityMana = cardTable.findAll("div", {"class": "cardtextbox"})

    # store card attirbute text values to array
    # store card attirbute text values to array
    infoArray, cardArray = getCardStuff(cardInfo, infoTypes, abilityMana)

    cardArray, infoArray = getLegal(cardArray, infoArray, legalLink)

    # check for mana cost, add symbol if exists
    try:
        mana = manaCost.find("div", {"class": "value"})
        manaString += " " + getMana(mana)
        abilityManaString.strip()
        cardArray[1] = manaString.strip()
    except AttributeError:
        pass

    setImg = cardTable.find("div", id=re.compile("currentSetSymbol$"))
    set = setImg.a.img
    getSet(set)

    # get card image
    # image_name = cardArray[0].replace('"', '')
    # image_name = image_name.replace(':', '')
    # cardFile = Path('Images/Card/' + image_name + '.jpg')
    # if not cardFile.is_file():
    #     f = open('Images/Card/' + image_name + '.jpg', 'wb')
    #     f.write(uReq(siteURL + cardImage[5:]).read())
    #     f.close()

    # create dictionary for writing
    for i in range(0, len(cardArray)):
        if infoArray[i] == 'P/T':
            p, t = cardArray[i].split('/')
            csvDict['P'] = p
            csvDict['T'] = t
        else:
            csvDict[infoArray[i].replace(" ", "_")] = cardArray[i]
    transDiv = card_soup.find("div", {"id": "ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ctl03_nameRow"})
    transName = transDiv.find("div", {"class": "value"})
    csvDict['Trans_Card'] = transName.text.strip()
    with open('cards.csv', 'a', encoding='utf8', newline='') as csvfile:
        scrapeTo = csv.DictWriter(csvfile, fieldnames=card_values)
        scrapeTo.writerow(csvDict)
    return


def flip_card_parse2 (card_soup):
    csvDict = {}
    manaString = ""
    abilityManaString = ""
    cardImage = card_soup.find("td", {"id": "ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ctl03_Td1"}).img["src"]
    cardTD = card_soup.find("td", {"id": "ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ctl03_rightCol"})
    cardInfo = cardTD.findAll("div", {"class": "value"})
    infoTypes = cardTD.findAll("div", {"class": "label"})
    manaCost = cardTD.find("div", id=re.compile("manaRow$"))
    abilityMana = cardTD.findAll("div", {"class": "cardtextbox"})

    # store card attirbute text values to array
    infoArray, cardArray = getCardStuff(cardInfo, infoTypes, abilityMana)

    cardArray, infoArray = getLegal(cardArray, infoArray, legalLink)

    # check for mana cost, add symbol if exists
    try:
        mana = manaCost.find("div", {"class": "value"})
        manaString += " " + getMana(mana)
        abilityManaString.strip()
        cardArray[1] = manaString.strip()
    except AttributeError:
        pass

    setImg = cardTD.find("div", id=re.compile("currentSetSymbol$"))
    set = setImg.a.img
    getSet(set)

    # get card image
    # image_name = cardArray[0].replace('"', '')
    # image_name = image_name.replace(':', '')
    # cardFile = Path('Images/Card/' + image_name + '.jpg')
    # if not cardFile.is_file():
    #     f = open('Images/Card/' + image_name + '.jpg', 'wb')
    #     f.write(uReq(siteURL + cardImage[5:]).read())
    #     f.close()

    # create dictionary for writing
    for i in range(0, len(cardArray)):
        if (infoArray[i] == 'P/T'):
            p, t = cardArray[i].split('/')
            csvDict['P'] = p
            csvDict['T'] = t
        else:
            csvDict[infoArray[i].replace(" ", "_")] = cardArray[i]
    try:
        transDiv = card_soup.find("div", {"id": "ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ctl02_nameRow"})
        transName = transDiv.find("div", {"class": "value"})
    except AttributeError:
        transDiv = card_soup.find("div", {"id": "ctl00_ctl00_ctl00_MainContent_SubContent_SubContent_ctl04_nameRow"})
        transName = transDiv.find("div", {"class": "value"})
    csvDict['Trans_Card'] = transName.text.strip()
    with open('cards.csv', 'a', encoding='utf8', newline='') as csvfile:
        scrapeTo = csv.DictWriter(csvfile, fieldnames=card_values)
        scrapeTo.writerow(csvDict)
    return


my_url = 'http://gatherer.wizards.com/Pages/Search/Default.aspx?text=+%5Btransform%5D'

# opening connection, grabbing page
uClient = uReq(my_url)
page_html = uClient.read()

# html parsing
page_soup = soup(page_html, "lxml")

page_nums = page_soup.find("div", {"class": "paging"})

# grabs cardInfo div

siteURL = "http://gatherer.wizards.com"

# scrapeTo = csv.writer(open('card.csv', 'wb'))
cardCount = 0
current_page = 0

while (current_page < 3):
    # page_nums = page_soup.find("div", {"class": "paging"})
    # pages = page_nums.findAll('a')
    # if not pages:
    #     aTag = '<a href="">1</a>'
    #     aSoup = soup(aTag, 'lxml')
    #     pages = []
    #     pages.append(aSoup)
    #
    # # open csv file
    # for page in pages:
    print(current_page)
    #     if page.text == str(current_page):
            # if len(pages) > 1:
    # page_url = page.get('href')
    pageClient = uReq('http://gatherer.wizards.com/Pages/Search/Default.aspx?page='+str(current_page)+'&action=advanced&set=+["Dominaria"]')
    # else:
    #     pageClient = uReq(my_url)
    pageNum_html = pageClient.read()
    page_soup2 = soup(pageNum_html, "lxml")
    cardLink = page_soup2.findAll("div", {"class": "cardInfo"})
    cardLink = page_soup2.findAll("div", {"class": "cardInfo"})

    # iterate through cards on page
    for card in cardLink:
        cardURL = 'http://gatherer.wizards.com/Pages/' + card.a.get('href')[3:]
        # cardURL = 'http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=4369'
        cardClient = uReq(cardURL)
        card_html = cardClient.read()
        card_soup = soup(card_html, "lxml")
        cardDict = {}
        try:
            legalLink = card_soup.find("a", {"id": "ctl00_ctl00_ctl00_MainContent_SubContent_SubContentAnchors_DetailsAnchors_PrintingsLink"}).get('href')
            cardImage = card_soup.find("div", {"class": "cardImage"}).img["src"]
            card_parse(card_soup, cardImage, legalLink)
            cardCount += 1
            print(cardCount, " cards finished")
        except AttributeError:
            for i in range(0,2):
                if i == 0:
                    flip_card_parse1(card_soup, legalLink)
                else:
                    flip_card_parse2(card_soup)
                cardCount += 1
                print(cardCount, " cards finished")
        # for key, val in cardDict.items():
        #     print(key, "=>", val)
        # write, increment counter
        cardClient.close()
    # if current_page % 10 == 0 and current_page != 10:
    #     longPause = random.randint(15, 20)
    #     print('pausing for ', longPause, ' minutes')
    #     time.sleep(longPause*60)
    # if current_page % 2 == 0 and current_page != 10:
    #     pause = random.randint(10, 20)
    #     print('pausing for ', pause, ' seconds')
    #     time.sleep(pause)
    pageClient.close()
    current_page += 1
uClient.close()

