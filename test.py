import AO3

work = AO3.Work(37522864)

print(f"TAGS: {work.tags}")
print(f"PUBLISHED: {work.date_published}")
print(f"UPDATED: {work.date_updated}")

e = len(work.chapters)
e = work.id
e = work.chapters[0].text
e = work.chapters[0].title
e = work.chapters[0].text