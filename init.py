from events.models import Person, Event, Comment, Link

maxf_homepage=Link(title='site perso', url='http://lapin-bleu.net')
maxf_homepage.save()

maxf_linkedin=Link(title='linkedIn', url='http://www.linkedin.com/pub/max-froumentin/1/598/376')
maxf_linkedin.save()

christophe_workpage=Link(title='page au LIFL', url='http://www.lifl.fr/~chaillou/')
christophe_workpage.save()

vrst97=Link(title='ps.gz', url="http://www.w3.org/People/maxf/past/research/publications/vrst97.ps.gz")
vrst97.save()

maxf=Person(name='Max Froumentin')
maxf.save()
maxf.links.add(maxf_linkedin)
maxf.links.add(maxf_homepage)

christophe=Person(name='Christophe Chaillou')
christophe.save()
christophe.links.add(christophe_workpage)

sylvain=Person(name='Sylvain Karpf')
sylvain.save()

eric_varlet=Person(name='Eric Varlet')
eric_varlet.save()

these_max=Event(title='Soutenance de Max',description='Soutenance de Thèse de Doctorat',eventType='soutenance',date='1996-06-27')
these_max.save()
these_max.people.add(maxf);

these_max_comment1=Comment(text='Wonderful!', event=these_max)
these_max_comment1.save()
these_max_comment2=Comment(text='Bof', event=these_max)
these_max_comment2.save()

afig_93=Event(title='AFIG 93',description='Premières journées de l\'AFIG',eventType='conférence',date='1993-09-30')
afig_93.save()
afig_93.people.add(maxf)
afig_93.people.add(christophe)
afig_93.people.add(sylvain)

afig_93_comment1=Comment(text='On s\'est bien marrés', event=afig_93)
afig_93_comment1.save()

vrst97_paper=Event(
    title='Dynamic implicit surface tesselation',
    description='Proceedings of The ACM Symposium on Virtual Reality Software And Technology, Lausane, 1997',
    eventType='paper',
    date='1997-09-15'
)
vrst97_paper.save()
vrst97_paper.links.add(vrst97)
vrst97_paper.people.add(maxf)
vrst97_paper.people.add(eric_varlet)
