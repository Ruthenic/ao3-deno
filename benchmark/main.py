import os, AO3

sess = AO3.Session("mdrakea3@tutanota.com", os.environ["PASSWORD"])
work = AO3.Work(43757691, session=sess)

print(work.tags)

print(work.chapters[0].text)