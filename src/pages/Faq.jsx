import React from 'react';
import { Titled } from 'react-titled';
import t from 'prop-types';
import clsx from 'clsx';
import { useHistory, useLocation } from 'react-router';
import { Col, Row, Typography } from 'antd';
import { LinkOutlined } from '@ant-design/icons';
import scrollIntoView from 'scroll-into-view-if-needed';
import styled, { createGlobalStyle } from 'styled-components';
import * as r from '~/app/routes';
import CollapsibleSection from '~/shared/CollapsibleSection';
import { TelegramIcon } from '~/shared/icons';
import Button from '~/shared/Button';
import Spacer from '~/shared/Spacer';
import SingleCardLayout from './layouts/SingleCardLayout';

function Faq() {
  const history = useHistory();
  const { hash } = useLocation();
  const targetQA = React.useRef(null);

  React.useEffect(() => {
    if (hash && hash !== '#') {
      targetQA.current = document.querySelector(hash);

      if (targetQA.current) {
        scrollIntoView(targetQA.current, {
          scrollMode: 'if-needed',
          behavior: 'auto',
          block: 'center',
          inline: 'center',
        });
      }
    } else {
      targetQA.current = null;
    }
  }, [hash]);

  useOnClickOutside(
    targetQA,
    React.useCallback(() => {
      history.push(r.FAQ);
    }, [history])
  );

  return (
    <Titled title={title => `F.A.Q. | ${title}`}>
      <SingleCardLayout title="F.A.Q.">
        <ResetCounter />
        {faqs.map(([question, answer]) => (
          <QA question={question} key={question} answer={answer} />
        ))}
        <Spacer size={3} />
        <aside>
          <StyledSectionTitle>Are you still in doubt?</StyledSectionTitle>
          <Spacer />
          <Row gutter={16}>
            <Col>
              <Button
                variant="filled"
                icon={<TelegramIcon />}
                href="https://t.me/kleros"
                target="_blank"
                rel="noreferer noopener"
              >
                Get help on our Telegram Group
              </Button>
            </Col>
            <Col>
              <Button
                variant="outlined"
                href="https://blog.kleros.io/linguo-decentralized-translation-platform/"
                target="_blank"
                rel="noreferer noopener"
              >
                Linguo Guide
              </Button>
            </Col>
          </Row>
        </aside>
      </SingleCardLayout>
    </Titled>
  );
}

export default Faq;

function QA({ question, answer }) {
  const slug = slugify(question);
  const { hash } = useLocation();
  const isTargeted = hash.slice(1) === slug;

  return (
    <StyledQA
      id={slug}
      className={clsx({
        target: isTargeted,
      })}
    >
      <StyledQuestionAnchor href={`#${slug}`}>
        <LinkOutlined />
      </StyledQuestionAnchor>
      <StyledCollapsibleSection
        title={<StyledQuestion>{question}</StyledQuestion>}
        titleLevel={2}
        forceOpen={isTargeted}
      >
        <StyledAnswer>{typeof answer === 'string' ? <p>{answer}</p> : answer}</StyledAnswer>
      </StyledCollapsibleSection>
    </StyledQA>
  );
}

QA.propTypes = {
  question: t.node.isRequired,
  answer: t.node.isRequired,
};

function useOnClickOutside(ref, onClick) {
  React.useEffect(() => {
    function handleClickOutside(evt) {
      if (ref.current && !ref.current.contains(evt.target)) {
        onClick(evt);
      }
    }

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [ref, onClick]);
}

const slugify = str =>
  str
    .replace(/[^A-Za-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/(^-)|(-$)/, '')
    .toLowerCase();

const ResetCounter = createGlobalStyle`
  counter-reset: faq;
`;

const StyledQA = styled.div`
  counter-increment: faq;
  position: relative;

  & + & {
    margin-top: 2rem;
  }

  &.target {
    ::before {
      content: '';
      border-radius: 0.75rem;
      box-shadow: 0 0 0.375rem ${props => props.theme.color.shadow.default};
      position: absolute;
      z-index: 0;
      top: -1rem;
      right: -1rem;
      bottom: -1rem;
      left: -1rem;
    }
  }

  > * {
    position: relative;
    z-index: 1;
  }
`;

const StyledQuestionAnchor = styled.a`
  z-index: 2;
  position: absolute;
  left: 0.5rem;
  top: 0.625rem;
  text-align: center;
  color: ${p => p.theme.color.text.inverted};
  transition: all 0.25s cubic-bezier(0.77, 0, 0.175, 1);

  :hover,
  :focus {
    color: ${p => p.theme.color.text.inverted};
    filter: drop-shadow(0 0 2px ${p => p.theme.color.glow.default});
  }
`;

const StyledCollapsibleSection = styled(CollapsibleSection)`
  z-index: 1;
`;

const StyledQuestion = styled.span`
  ::before {
    content: counter(faq) '. ';
  }
`;

const StyledAnswer = styled.div`
  padding: 1rem;
  color: ${p => p.theme.color.text.light};
  font-size: ${p => p.theme.fontSize.sm};
  font-weight: ${p => p.theme.fontWeight.regular};

  > * {
    margin: 0;
  }

  > * + * {
    margin-top: 0.5rem;
  }
`;

const StyledDefinitionList = styled.dl`
  && {
    margin: 0;
    padding-left: 1.75rem;

    p + & {
      margin-top: 0.5rem;
    }

    dt::before {
      content: '•';
      margin-right: 0.25rem;
    }

    dt,
    dd {
      display: inline;
    }
  }
`;

const StyledOrderedList = styled.ol`
  && {
    margin: 0;
    padding-left: 2.75rem;

    p + & {
      margin-top: 0.5rem;
    }
  }
`;

const StyledSectionTitle = styled(Typography.Title)`
  && {
    font-size: ${p => p.theme.fontSize.xxl};
  }
`;

const faqs = [
  ['How does Linguo evaluate translators skills?', 'Short answer: it does not. Translator skills are self-declared.'],
  [
    'If there is no evaluation process, how can I be sure the translator is qualified enough for the job?',
    <>
      <p>
        Linguo uses cryptoeconomic incentives to regulate the behavior of users. Translators are required to provide a
        deposit when they are assigned to a task.
      </p>
      <p>
        After the translated text is submitted, there is a review period. During this time, anyone (including yourself)
        can look for potential flaws in the translation and raise a challenge.
      </p>
      <p>
        If a translation is challenged, a case is created in a specialized Kleros court which decides whether or not the
        translation fulfills the requirements. If the challenger wins the case, the translator loses the initial
        deposit, which is then sent to the challenger as a reward for her or his work.
      </p>
      <p>
        This way we incentivize translators to only accept tasks they think they are qualified enough to work on,
        otherwise they will suffer financial losses.
      </p>
    </>,
  ],
  [
    'How are translator skills defined in Linguo?',
    <>
      <p>
        Linguo considers language skills as defined by the{' '}
        <a
          href="https://www.coe.int/en/web/common-european-framework-reference-languages/level-descriptions"
          target="_blank"
          rel="noopener noreferrer"
        >
          Common European Framework of Reference (CEFR).
        </a>
      </p>
    </>,
  ],
  [
    'I am not sure how I rank on the CEFR scale. How can I find out?',
    <>
      <p>
        You can test your skills by using this{' '}
        <a
          href="https://rm.coe.int/CoERMPublicCommonSearchServices/DisplayDCTMContent?documentId=090000168045bb52"
          target="_blank"
          rel="noopener noreferrer"
        >
          self-assessment grid.
        </a>
      </p>
    </>,
  ],
  [
    'What are the Linguo translation tiers?',
    <>
      <p>Linguo translation tasks can be defined in 3 different quality tiers:</p>
      <StyledDefinitionList>
        <div>
          <dt>Cost Effective:</dt>{' '}
          <dd>
            A basic translation. The conveyed meaning must be the similar, but nuances might be lost. Occasional typos
            and translation errors are acceptable.
          </dd>
        </div>
        <div>
          <dt>Standard:</dt>{' '}
          <dd>
            The standard level of a translation. The meaning must be almost identical. Occasional typos are acceptable.
          </dd>
        </div>
        <div>
          <dt>Professional:</dt>{' '}
          <dd>
            Professional translation. The meaning and spirit of the translation must remain identical and the translator
            must reflect the style and nuances of the original text. Translators are expected to have their text
            reviewed before submission.
          </dd>
        </div>
      </StyledDefinitionList>
    </>,
  ],
  [
    'How does my skill levels affect the amount of tasks I will be able to work on as a translator?',
    <>
      <p>Translation tasks are available according to the required translation tier as specified by requesters:</p>
      <StyledDefinitionList>
        <div>
          <dt>Cost Effective:</dt> <dd>translators with B2 level and above.</dd>
        </div>
        <div>
          <dt>Standard:</dt> <dd>translators with C1 level and above.</dd>
        </div>
        <div>
          <dt>Professional:</dt> <dd>only translators with C2 level.</dd>
        </div>
      </StyledDefinitionList>
      <p>Notice that if your level is lower than B2, you will not be eligible for any translation tasks in Linguo.</p>
    </>,
  ],
  [
    'Why does Linguo support only translations from and to English?',
    <>
      <p>
        Currently it is too hard to find specialized jurors to evaluate a translation between an arbitrary pair of
        languages (e.g.: Korean &harr; Russian).
      </p>
      <p>We use English as the &ldquo;pivot&rdquo; language, so there can be enough jurors.</p>
    </>,
  ],
  [
    'I need a translation between two languages other than English. What do I do then?',
    <>
      <p>At this point, there is one way to do this. Let&rsquo;s say you want a translation Korean &rarr; Russian:</p>
      <StyledOrderedList>
        <li>You should first create a translation task for Korean &rarr; English.</li>
        <li>
          Then, after this intermediate translation is delivered, you can create another one for English &rarr; Russian.
        </li>
      </StyledOrderedList>
    </>,
  ],
  [
    'Why do I need to set a minimum and a maximum price when requesting a translation?',
    <>
      <p>
        From the moment you create the translation task to the moment some translator assigns to it, the price will
        increase linearly. The higher the payout, the more interesting it will be for translators to work on your
        translation task.
      </p>
      <p>This will help you discover the right prices for your tasks.</p>
      <p>If you would like to avoid this mechanism, you can set the same value for both minium and maximum price.</p>
    </>,
  ],
  [
    'What happens to my deposit if a translator picks up the task before it reaches the maximum price?',
    <>
      <p>
        When a translator is assigned to a task, your remaining deposit &mdash; the maximum price minus the current
        price &mdash; is immediately sent back to your wallet.
      </p>
      <p>This is done automatically, there is no need for user input.</p>
    </>,
  ],
  [
    'Is there a limit in the number of translations tasks I can request on Linguo?',
    'No. You can request as many tasks as you want, even at the same time.',
  ],
  [
    'Is there a limit in size (text length) of translations tasks I can request on Linguo?',
    <>
      <p>There is no hard limit.</p>
      <p>
        If a task is too long, reviewers will probably try to optimize their work and evaluate only certain segments of
        the whole text. This might lead to reviewers overlooking certain mistakes in the translation.
      </p>
      <p>
        It is safe to expect that reviewers will be efficient enough in finding errors (as they are financially
        incentivized to), however if the translation is critical, you should also make sure to do a double check and
        review the translation yourself.
      </p>
      <p>We advise you to break longer translations in multiple parts whose individual size is around 4,000 words.</p>
      <p>
        Notice that currently there is no guarantee that all individual tasks will be assigned to the same translator,
        as anyone with the required skills could do this at any time.
      </p>
    </>,
  ],
];
