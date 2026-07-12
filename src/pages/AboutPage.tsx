import { GithubLogo } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { pageTitle } from "@/lib/seo";
import { useDocumentHead } from "@/lib/useDocumentHead";

const GITHUB_URL = "https://github.com/gregorybchris/metaphorist";

const CITATIONS = [
  {
    text: (
      <>
        Lakoff, George, and Mark Johnson. 1980. <em>Metaphors We Live By</em>.
        Chicago: University of Chicago Press.
      </>
    ),
  },
  {
    text: (
      <>
        Dodge, Ellen, Jisup Hong, and Elise Stickles. 2015. “MetaNet: Deep
        semantic automatic metaphor analysis.” In{" "}
        <em>Proceedings of the Third Workshop on Metaphor in NLP</em>, 40–49.
        Denver, Colorado: Association for Computational Linguistics.
      </>
    ),
  },
  {
    text: (
      <>
        Lakoff, George, Jane Espenson, and Alan Schwartz. 1991.{" "}
        <em>Master Metaphor List</em>, 2nd draft copy. Berkeley: Cognitive
        Linguistics Group, University of California, Berkeley.
      </>
    ),
  },
  {
    text: (
      <>
        David, Oana. 2017. “Computational approaches to metaphor: The case of
        MetaNet.” In <em>The Cambridge Handbook of Cognitive Linguistics</em>,
        edited by Barbara Dancygier, 574–589. Cambridge: Cambridge University
        Press.
      </>
    ),
  },
  {
    text: (
      <>
        Grady, Joseph Edward. 1997. “Foundations of Meaning: Primary
        Metaphors and Primary Scenes.” PhD diss., University of California,
        Berkeley.
      </>
    ),
  },
  {
    text: (
      <>
        Kövecses, Zoltán. 2010. <em>Metaphor: A Practical Introduction</em>.
        2nd ed. New York: Oxford University Press.
      </>
    ),
  },
  {
    text: (
      <>
        Anderson, Wendy, Ellen Bramwell, and Carole Hough, eds.{" "}
        <em>Mapping Metaphor with the Historical Thesaurus</em>. University
        of Glasgow.{" "}
        <a
          href="https://mappingmetaphor.arts.gla.ac.uk/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-text"
        >
          mappingmetaphor.arts.gla.ac.uk
        </a>
        .
      </>
    ),
  },
  {
    text: (
      <>
        Mohler, Michael, Mary Brunson, Bryan Rink, and Marc Tomlinson. 2016.
        “Introducing the LCC Metaphor Datasets.” In{" "}
        <em>
          Proceedings of the Tenth International Conference on Language
          Resources and Evaluation (LREC 2016)
        </em>
        , 4221–4227. Portorož, Slovenia: European Language Resources
        Association.
      </>
    ),
  },
];

export function AboutPage() {
  useDocumentHead({
    title: pageTitle("About"),
    description:
      "About the Metaphorist dataset: its sources in Conceptual Metaphor Theory, how to get " +
      "the data, and how to cite it.",
    path: "/about",
  });

  return (
    <div className="mx-auto max-w-2xl p-6 md:p-10">
      <h1 className="font-serif text-2xl text-text sm:text-3xl">
        About this project
      </h1>

      <div className="mt-6 space-y-4 text-pretty leading-relaxed text-text-muted">
        <p>
          This project explores Conceptual Metaphor Theory (Lakoff & Johnson):
          the idea that we understand abstract concepts (theories, ideas, time,
          life) systematically in terms of more concrete ones (buildings, food,
          money, journeys), and that this shows up as everyday patterns in
          language.
        </p>
      </div>

      <div className="mt-10">
        <p className="font-serif text-lg text-text">Get the data</p>
        <p className="mt-2 text-sm text-text-muted">
          The full dataset is open source. Browse or download it from the
          GitHub repository.
        </p>
        <a
          href={GITHUB_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 text-sm text-text-muted underline hover:text-text"
        >
          <GithubLogo className="h-4 w-4" weight="fill" />
          gregorybchris/metaphorist
        </a>
      </div>

      <div className="mt-10">
        <p className="font-serif text-lg text-text">Citing this data</p>
        <p className="mt-2 text-sm text-text-muted">
          This dataset derives from the MetaNet Metaphor Repository, the
          Master Metaphor List, Joseph Grady's inventory of primary
          metaphors, Zoltán Kövecses' survey of common source/target
          domains, the University of Glasgow's Mapping Metaphor project, and
          the LCC/IARPA Metaphor Datasets. If you use this data, please cite
          the underlying sources:
        </p>
        <ul className="mt-4 space-y-4">
          {CITATIONS.map((citation, i) => (
            <li
              key={i}
              className="border-l-2 border-border pl-4 text-sm leading-relaxed text-text-muted"
            >
              {citation.text}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-10 border-t border-border pt-6">
        <Link
          to="/metaphors"
          className="text-sm text-text-muted underline hover:text-text"
        >
          Back to the metaphors
        </Link>
      </div>
    </div>
  );
}
